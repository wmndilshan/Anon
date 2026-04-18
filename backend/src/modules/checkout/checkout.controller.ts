import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { CheckoutService } from './checkout.service';
import { PlaceOrderDto } from './dto/place-order.dto';

@ApiTags('checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('orders')
  place(@CurrentUser() user: JwtPayload, @Body() dto: PlaceOrderDto) {
    return this.checkout.placeOrder({
      userId: user.sub,
      shippingAddressId: dto.shippingAddressId,
      billingAddressId: dto.billingAddressId,
      shippingMethodCode: dto.shippingMethodCode,
      couponCode: dto.couponCode,
      paymentProvider: dto.paymentProvider,
      customerNote: dto.customerNote,
    });
  }
}
