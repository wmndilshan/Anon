import { BadRequestException, Injectable } from '@nestjs/common';
import { CouponAppliesTo, CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type CouponEvaluationInput = {
  code: string;
  userId: string;
  subtotal: Prisma.Decimal;
  productIds: string[];
  categoryIds: string[];
};

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluate(input: CouponEvaluationInput) {
    const code = input.code.trim().toUpperCase();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: { couponProducts: true, couponCategories: true },
    });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid coupon');

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw new BadRequestException('Coupon not active yet');
    if (coupon.endsAt && coupon.endsAt < now) throw new BadRequestException('Coupon expired');

    if (coupon.minOrderAmount && Number(input.subtotal) < Number(coupon.minOrderAmount)) {
      throw new BadRequestException('Order below minimum for coupon');
    }

    if (coupon.appliesTo === CouponAppliesTo.PRODUCTS) {
      const allowed = new Set(coupon.couponProducts.map((p) => p.productId));
      const ok = input.productIds.some((id) => allowed.has(id));
      if (!ok) throw new BadRequestException('Coupon not applicable to cart products');
    }
    if (coupon.appliesTo === CouponAppliesTo.CATEGORIES) {
      const allowed = new Set(coupon.couponCategories.map((c) => c.categoryId));
      const ok = input.categoryIds.some((id) => allowed.has(id));
      if (!ok) throw new BadRequestException('Coupon not applicable to cart categories');
    }

    if (coupon.usageLimitGlobal != null) {
      const used = await this.prisma.couponUsage.count({ where: { couponId: coupon.id } });
      if (used >= coupon.usageLimitGlobal) throw new BadRequestException('Coupon usage limit reached');
    }
    if (coupon.usageLimitPerUser != null) {
      const used = await this.prisma.couponUsage.count({
        where: { couponId: coupon.id, userId: input.userId },
      });
      if (used >= coupon.usageLimitPerUser) throw new BadRequestException('Coupon already used');
    }

    let discount = new Prisma.Decimal(0);
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = new Prisma.Decimal(input.subtotal).mul(coupon.value).div(100);
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discount = new Prisma.Decimal(coupon.value);
    }
    if (coupon.maxDiscountAmount && discount.gt(coupon.maxDiscountAmount)) {
      discount = new Prisma.Decimal(coupon.maxDiscountAmount);
    }
    if (discount.gt(input.subtotal)) discount = new Prisma.Decimal(input.subtotal);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discount,
    };
  }
}
