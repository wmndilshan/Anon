import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { OrdersService } from './orders.service';

@ApiTags('admin-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @RequirePermissions('orders.read')
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('status') status?: string) {
    return this.orders.adminList(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      status,
    );
  }

  @Get(':id')
  @RequirePermissions('orders.read')
  get(@Param('id') id: string) {
    return this.orders.adminGet(id);
  }

  @Patch(':id')
  @RequirePermissions('orders.write')
  patch(
    @Param('id') id: string,
    @Body()
    body: { status?: string; fulfillmentStatus?: string; trackingNumber?: string },
  ) {
    return this.orders.adminUpdateStatus(id, body);
  }
}
