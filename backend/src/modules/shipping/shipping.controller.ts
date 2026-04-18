import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('methods')
  methods() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
