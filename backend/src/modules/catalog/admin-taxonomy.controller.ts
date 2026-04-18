import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('admin-taxonomy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/catalog')
export class AdminTaxonomyController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('categories')
  @RequirePermissions('catalog.read')
  categories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, include: { children: true } });
  }

  @Post('categories')
  @RequirePermissions('catalog.write')
  createCategory(@Body() body: { slug: string; name: string; parentId?: string }) {
    return this.prisma.category.create({ data: body });
  }

  @Get('brands')
  @RequirePermissions('catalog.read')
  brands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('brands')
  @RequirePermissions('catalog.write')
  createBrand(@Body() body: { slug: string; name: string; description?: string }) {
    return this.prisma.brand.create({ data: body });
  }

  @Get('collections')
  @RequirePermissions('catalog.read')
  collections() {
    return this.prisma.collection.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  @Post('collections')
  @RequirePermissions('catalog.write')
  createCollection(@Body() body: { slug: string; name: string; featured?: boolean }) {
    return this.prisma.collection.create({ data: body });
  }
}
