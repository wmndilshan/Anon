import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { CartService } from './cart.service';

class AddCartItemDto {
  variantId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload) {
    return this.cart.getOrCreateCart(user.sub);
  }

  @Post('items')
  add(@CurrentUser() user: JwtPayload, @Body() body: AddCartItemDto) {
    return this.cart.addItem(user.sub, body.variantId, body.quantity);
  }

  @Patch('items/:variantId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('variantId') variantId: string,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.cart.setQuantity(user.sub, variantId, body.quantity);
  }

  @Delete('items/:variantId')
  remove(@CurrentUser() user: JwtPayload, @Param('variantId') variantId: string) {
    return this.cart.removeItem(user.sub, variantId);
  }

  @Delete()
  clear(@CurrentUser() user: JwtPayload) {
    return this.cart.clear(user.sub);
  }
}
