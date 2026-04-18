import { Module } from '@nestjs/common';
import { ShippingCalculatorService } from './shipping-calculator.service';
import { ShippingController } from './shipping.controller';

@Module({
  controllers: [ShippingController],
  providers: [ShippingCalculatorService],
  exports: [ShippingCalculatorService],
})
export class ShippingModule {}
