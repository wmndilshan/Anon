import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProviderKind } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class PlaceOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  shippingAddressId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billingAddressId?: string;

  @ApiProperty({ example: 'standard' })
  @IsString()
  @MinLength(1)
  shippingMethodCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ enum: PaymentProviderKind })
  @IsEnum(PaymentProviderKind)
  paymentProvider: PaymentProviderKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNote?: string;
}
