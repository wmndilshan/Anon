import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponType, CouponAppliesTo } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('admin-coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('catalog.write')
  list(@Query('page') page?: string, @Query('pageSize') ps?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const size = ps ? parseInt(ps, 10) : 20;
    const skip = (p - 1) * size;
    return this.prisma.$transaction([
      this.prisma.coupon.count(),
      this.prisma.coupon.findMany({ skip, take: size, orderBy: { createdAt: 'desc' } }),
    ]).then(([total, items]) => ({ items, total, page: p, pageSize: size }));
  }

  @Post()
  @RequirePermissions('catalog.write')
  create(
    @Body()
    body: {
      code: string;
      type: CouponType;
      value: string;
      appliesTo?: CouponAppliesTo;
      minOrderAmount?: string;
      maxDiscountAmount?: string;
      usageLimitGlobal?: number;
      usageLimitPerUser?: number;
      startsAt?: string;
      endsAt?: string;
    },
  ) {
    return this.prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: new Prisma.Decimal(body.value),
        appliesTo: body.appliesTo ?? CouponAppliesTo.ALL,
        minOrderAmount: body.minOrderAmount ? new Prisma.Decimal(body.minOrderAmount) : null,
        maxDiscountAmount: body.maxDiscountAmount ? new Prisma.Decimal(body.maxDiscountAmount) : null,
        usageLimitGlobal: body.usageLimitGlobal,
        usageLimitPerUser: body.usageLimitPerUser,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
      },
    });
  }

  @Patch(':id')
  @RequirePermissions('catalog.write')
  patch(@Param('id') id: string, @Body() body: { isActive?: boolean }) {
    return this.prisma.coupon.update({ where: { id }, data: body });
  }
}
