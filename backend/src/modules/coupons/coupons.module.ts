import { Module } from '@nestjs/common';
import { AdminCouponsController } from './admin-coupons.controller';
import { CouponService } from './coupon.service';

@Module({
  controllers: [AdminCouponsController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponsModule {}
