import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('admin-rbac')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/rbac')
export class AdminRbacController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('roles')
  @RequirePermissions('roles.read')
  roles() {
    return this.prisma.role.findMany({
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  @Get('permissions')
  @RequirePermissions('roles.read')
  permissions() {
    return this.prisma.permission.findMany();
  }

  @Post('users/:userId/roles')
  @RequirePermissions('roles.write')
  assign(@Param('userId') userId: string, @Body() body: { roleIds: string[] }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      for (const roleId of body.roleIds) {
        await tx.userRole.create({ data: { userId, roleId } });
      }
      return tx.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } },
      });
    });
  }

  @Post('staff')
  @RequirePermissions('roles.write')
  async createStaff(
    @Body()
    body: { email: string; password: string; firstName?: string; lastName?: string; roleIds: string[] },
  ) {
    const hash = await bcrypt.hash(body.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash: hash,
        firstName: body.firstName,
        lastName: body.lastName,
        userType: UserType.STAFF,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });
    for (const roleId of body.roleIds) {
      await this.prisma.userRole.create({ data: { userId: user.id, roleId } });
    }
    return this.prisma.user.findUnique({
      where: { id: user.id },
      include: { userRoles: { include: { role: true } } },
    });
  }
}
