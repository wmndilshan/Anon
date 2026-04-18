import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserStatus, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<ReturnType<typeof baseUser>> = {}) {
  return { ...baseUser(), ...overrides };
}

function baseUser(): {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: '$2b$12$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    userType: UserType.CUSTOMER,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: null,
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── mock factory ─────────────────────────────────────────────────────────────

function buildMocks() {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userRole: { findMany: jest.fn().mockResolvedValue([]) },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    emailVerificationToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    notificationOutbox: { create: jest.fn() },
    $transaction: jest.fn(),
  } as any;

  const jwtMock: Partial<JwtService> = {
    signAsync: jest.fn().mockResolvedValue('mock-access-token'),
  };

  const configMock: Partial<ConfigService> = {
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'jwt.accessExpires') return '15m';
      if (key === 'jwt.refreshExpires') return '7d';
      return undefined;
    }),
  };

  return { prismaMock, jwtMock, configMock };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: ReturnType<typeof buildMocks>['prismaMock'];
  let jwtMock: ReturnType<typeof buildMocks>['jwtMock'];

  beforeEach(() => {
    const mocks = buildMocks();
    prismaMock = mocks.prismaMock;
    jwtMock = mocks.jwtMock;
    service = new AuthService(prismaMock, jwtMock as JwtService, mocks.configMock as ConfigService);
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('throws ConflictException when email is already registered', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeUser());
      await expect(
        service.register({ email: 'test@example.com', password: 'password1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates a new user and returns tokens on success', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // no existing user
      const newUser = makeUser({ status: UserStatus.PENDING_VERIFICATION });
      prismaMock.user.create.mockResolvedValue(newUser);
      prismaMock.emailVerificationToken.create.mockResolvedValue({});
      prismaMock.notificationOutbox.create.mockResolvedValue({});
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(newUser);
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'new@example.com',
        password: 'password1',
        firstName: 'Jane',
      });

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(newUser.email);
    });

    it('lowercases the email before lookup and creation', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const newUser = makeUser({ email: 'upper@example.com', status: UserStatus.PENDING_VERIFICATION });
      prismaMock.user.create.mockResolvedValue(newUser);
      prismaMock.emailVerificationToken.create.mockResolvedValue({});
      prismaMock.notificationOutbox.create.mockResolvedValue({});
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(newUser);
      prismaMock.refreshToken.create.mockResolvedValue({});

      await service.register({ email: 'UPPER@EXAMPLE.COM', password: 'password1' });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'upper@example.com' },
      });
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      prismaMock.user.findUnique.mockResolvedValue(
        makeUser({ passwordHash: await bcrypt.hash('correct', 12) }),
      );
      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is disabled', async () => {
      const hash = await bcrypt.hash('password1', 12);
      prismaMock.user.findUnique.mockResolvedValue(
        makeUser({ passwordHash: hash, status: UserStatus.DISABLED }),
      );
      await expect(
        service.login({ email: 'test@example.com', password: 'password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns user and tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('password1', 12);
      const user = makeUser({ passwordHash: hash });
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(user);
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.login({ email: 'test@example.com', password: 'password1' });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(user.email);
    });
  });

  // ── staffLogin ────────────────────────────────────────────────────────────

  describe('staffLogin', () => {
    it('throws UnauthorizedException when user is not STAFF', async () => {
      const hash = await bcrypt.hash('password1', 12);
      prismaMock.user.findUnique.mockResolvedValue(
        makeUser({ passwordHash: hash, userType: UserType.CUSTOMER }),
      );
      await expect(
        service.staffLogin({ email: 'test@example.com', password: 'password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(
        service.staffLogin({ email: 'nobody@example.com', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens for valid STAFF credentials', async () => {
      const hash = await bcrypt.hash('password1', 12);
      const user = makeUser({ passwordHash: hash, userType: UserType.STAFF });
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.userRole.findMany.mockResolvedValue([]);
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(user);
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.staffLogin({ email: 'test@example.com', password: 'password1' });

      expect(result).toHaveProperty('accessToken');
    });
  });

  // ── refresh ───────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('throws UnauthorizedException when token is not found', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token is revoked', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400_000),
      });
      await expect(service.refresh('some-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token is expired', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.refresh('some-token')).rejects.toThrow(UnauthorizedException);
    });

    it('issues new tokens and revokes old token on success', async () => {
      const user = makeUser();
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        userId: user.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400_000),
      });
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.refreshToken.update.mockResolvedValue({});
      prismaMock.user.findUniqueOrThrow.mockResolvedValue(user);
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('valid-token');

      expect(prismaMock.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ revokedAt: expect.any(Date) }) }),
      );
      expect(result).toHaveProperty('accessToken');
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.logout('some-token');
      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('returns ok:true even when email does not exist (no enumeration)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword('ghost@example.com');
      expect(result).toEqual({ ok: true });
    });

    it('creates a reset token and outbox entry when user exists', async () => {
      const user = makeUser();
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.passwordResetToken.create.mockResolvedValue({});
      prismaMock.notificationOutbox.create.mockResolvedValue({});

      const result = await service.forgotPassword('test@example.com');

      expect(prismaMock.passwordResetToken.create).toHaveBeenCalled();
      expect(prismaMock.notificationOutbox.create).toHaveBeenCalled();
      expect(result).toMatchObject({ ok: true });
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('throws BadRequestException when token is not found', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);
      await expect(service.resetPassword('bad-token', 'newpass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when token has been used', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        userId: 'user-1',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600_000),
      });
      await expect(service.resetPassword('used-token', 'newpass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when token is expired', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        userId: 'user-1',
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.resetPassword('expired-token', 'newpass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('updates password and revokes all refresh tokens on success', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        userId: 'user-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 3600_000),
      });
      prismaMock.$transaction.mockImplementation((ops: any[]) => Promise.all(ops));

      await service.resetPassword('valid-token', 'newpass123');

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  // ── verifyEmail ───────────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('throws BadRequestException when token not found', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);
      await expect(service.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when token already consumed', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
        id: 'evt-1',
        userId: 'user-1',
        consumedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600_000),
      });
      await expect(service.verifyEmail('used-token')).rejects.toThrow(BadRequestException);
    });

    it('returns ok:true and runs transaction on success', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
        id: 'evt-1',
        userId: 'user-1',
        consumedAt: null,
        expiresAt: new Date(Date.now() + 3600_000),
      });
      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.verifyEmail('valid-token');

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });

  // ── loadJwtPayload ────────────────────────────────────────────────────────

  describe('loadJwtPayload', () => {
    it('throws UnauthorizedException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.loadJwtPayload('user-1')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is disabled', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeUser({ status: UserStatus.DISABLED }));
      await expect(service.loadJwtPayload('user-1')).rejects.toThrow(UnauthorizedException);
    });

    it('returns empty permissions array for CUSTOMER users', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeUser({ userType: UserType.CUSTOMER }));
      const payload = await service.loadJwtPayload('user-1');
      expect(payload.permissions).toEqual([]);
    });

    it('returns ["*"] when STAFF user has system.super permission', async () => {
      prismaMock.user.findUnique.mockResolvedValue(makeUser({ userType: UserType.STAFF }));
      prismaMock.userRole.findMany.mockResolvedValue([
        {
          role: {
            rolePermissions: [{ permission: { key: 'system.super' } }],
          },
        },
      ]);
      const payload = await service.loadJwtPayload('user-1');
      expect(payload.permissions).toEqual(['*']);
    });
  });

  // ── resendVerification ────────────────────────────────────────────────────

  describe('resendVerification', () => {
    it('deletes pending tokens and issues a new one', async () => {
      prismaMock.emailVerificationToken.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.emailVerificationToken.create.mockResolvedValue({});
      prismaMock.notificationOutbox.create.mockResolvedValue({});

      const result = await service.resendVerification('user-1');

      expect(prismaMock.emailVerificationToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', consumedAt: null },
      });
      expect(result).toMatchObject({ ok: true });
    });
  });
});
