import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { AdminCatalogService } from './admin-catalog.service';

@ApiTags('admin-catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/catalog/products')
export class AdminCatalogController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @RequirePermissions('catalog.read')
  list(@Query('page') page?: string, @Query('pageSize') ps?: string, @Query('status') status?: ProductStatus) {
    return this.catalog.listProducts(
      page ? parseInt(page, 10) : 1,
      ps ? parseInt(ps, 10) : 20,
      status,
    );
  }

  @Post()
  @RequirePermissions('catalog.write')
  create(@Body() body: Parameters<AdminCatalogService['createProduct']>[0]) {
    return this.catalog.createProduct(body);
  }

  @Post('variants/:variantId/inventory')
  @RequirePermissions('catalog.write')
  stock(@Param('variantId') variantId: string, @Body() body: { quantityOnHand: number }) {
    return this.catalog.upsertInventory(variantId, body.quantityOnHand);
  }

  @Get(':id')
  @RequirePermissions('catalog.read')
  get(@Param('id') id: string) {
    return this.catalog.getProduct(id);
  }

  @Patch(':id')
  @RequirePermissions('catalog.write')
  patch(@Param('id') id: string, @Body() body: Parameters<AdminCatalogService['updateProduct']>[1]) {
    return this.catalog.updateProduct(id, body);
  }
}
