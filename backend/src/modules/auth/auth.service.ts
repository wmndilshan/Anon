import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserStatus, UserType } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const REFRESH_BYTES = 48;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hashToken(raw: string) {
    return createHash('sha256').update(raw).digest('hex');
  }

  private async permissionKeysForUser(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });
    const keys = new Set<string>();
    for (const ur of rows) {
      for (const rp of ur.role.rolePermissions) {
        keys.add(rp.permission.key);
      }
    }
    if (keys.has('system.super')) return ['*'];
    return [...keys];
  }

  async loadJwtPayload(userId: string): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException('User not found');
    }
    const permissions =
      user.userType === UserType.STAFF ? await this.permissionKeysForUser(userId) : [];
    return {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      permissions,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        userType: UserType.CUSTOMER,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });

    await this.issueEmailVerification(user.id);

    const tokens = await this.issueTokens(user.id, UserType.CUSTOMER, []);
    return { user: this.sanitizeUser(user), ...tokens, message: 'Verify your email to activate.' };
  }

  private sanitizeUser(user: { id: string; email: string; firstName: string | null; lastName: string | null; userType: UserType; status: UserStatus; emailVerifiedAt: Date | null }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatus.DISABLED) throw new UnauthorizedException('Account disabled');

    const permissions =
      user.userType === UserType.STAFF ? await this.permissionKeysForUser(user.id) : [];
    const tokens = await this.issueTokens(user.id, user.userType, permissions);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async staffLogin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || user.userType !== UserType.STAFF) {
      throw new UnauthorizedException('Invalid staff credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatus.DISABLED) throw new UnauthorizedException('Account disabled');

    const permissions = await this.permissionKeysForUser(user.id);
    const tokens = await this.issueTokens(user.id, user.userType, permissions);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  private async issueTokens(userId: string, userType: UserType, permissions: string[]) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const accessSecret = this.config.getOrThrow<string>('jwt.accessSecret');
    const accessExpires = this.config.get<string>('jwt.accessExpires') ?? '15m';
    const refreshExpires = this.config.get<string>('jwt.refreshExpires') ?? '7d';

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email: user.email, userType, permissions },
      { secret: accessSecret, expiresIn: accessExpires as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );

    const rawRefresh = randomBytes(REFRESH_BYTES).toString('base64url');
    const tokenHash = this.hashToken(rawRefresh);
    const refreshDays = parseInt(String(refreshExpires).replace(/\D/g, ''), 10) || 7;
    const expiresAt = new Date(Date.now() + refreshDays * 86400_000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken: rawRefresh, expiresIn: accessExpires };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!row || row.revokedAt || row.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: row.userId } });
    if (!user || user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException('User invalid');
    }

    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });

    const permissions =
      user.userType === UserType.STAFF ? await this.permissionKeysForUser(user.id) : [];
    return this.issueTokens(user.id, user.userType, permissions);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { ok: true };

    const raw = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + 3600_000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    await this.prisma.notificationOutbox.create({
      data: {
        userId: user.id,
        channel: 'email',
        templateKey: 'password_reset',
        payload: { token: raw, email: user.email },
      },
    });

    return { ok: true, devToken: process.env.NODE_ENV !== 'production' ? raw : undefined };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const row = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { ok: true };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const row = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
    if (!row || row.consumedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { emailVerifiedAt: new Date(), status: UserStatus.ACTIVE },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: row.id },
        data: { consumedAt: new Date() },
      }),
    ]);
    return { ok: true };
  }

  private async issueEmailVerification(userId: string) {
    const raw = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + 72 * 3600_000);
    await this.prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });
    await this.prisma.notificationOutbox.create({
      data: {
        userId,
        channel: 'email',
        templateKey: 'email_verify',
        payload: { token: raw },
      },
    });
    return raw;
  }

  async resendVerification(userId: string) {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, consumedAt: null },
    });
    const raw = await this.issueEmailVerification(userId);
    return { ok: true, devToken: process.env.NODE_ENV !== 'production' ? raw : undefined };
  }
}
