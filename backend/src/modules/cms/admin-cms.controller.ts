import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BannerPlacement, CmsPageType } from '@prisma/client';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('admin-cms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/cms')
export class AdminCmsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('banners')
  @RequirePermissions('cms.read')
  banners() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  @Post('banners')
  @RequirePermissions('cms.write')
  createBanner(
    @Body()
    body: {
      placement: BannerPlacement;
      title?: string;
      imageUrl: string;
      linkUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.banner.create({ data: body });
  }

  @Patch('banners/:id')
  @RequirePermissions('cms.write')
  patchBanner(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.banner.update({ where: { id }, data: body as never });
  }

  @Get('pages')
  @RequirePermissions('cms.read')
  pages(@Query('page') page?: string, @Query('pageSize') ps?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const size = ps ? parseInt(ps, 10) : 20;
    const skip = (p - 1) * size;
    return this.prisma.$transaction([
      this.prisma.cmsPage.count(),
      this.prisma.cmsPage.findMany({ skip, take: size, orderBy: { updatedAt: 'desc' } }),
    ]).then(([total, items]) => ({ items, total, page: p, pageSize: size }));
  }

  @Post('pages')
  @RequirePermissions('cms.write')
  createPage(
    @Body()
    body: {
      slug: string;
      title: string;
      pageType?: CmsPageType;
      body: string;
      isPublished?: boolean;
    },
  ) {
    return this.prisma.cmsPage.create({
      data: {
        slug: body.slug,
        title: body.title,
        pageType: body.pageType ?? CmsPageType.CUSTOM,
        body: body.body,
        isPublished: body.isPublished ?? false,
      },
    });
  }

  @Patch('pages/:id')
  @RequirePermissions('cms.write')
  patchPage(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.cmsPage.update({ where: { id }, data: body as never });
  }

  @Get('homepage-sections')
  @RequirePermissions('cms.read')
  sections() {
    return this.prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  @Post('homepage-sections')
  @RequirePermissions('cms.write')
  createSection(@Body() body: { key: string; title: string; subtitle?: string; sortOrder?: number }) {
    return this.prisma.homepageSection.create({ data: body });
  }

  @Delete('homepage-sections/:id')
  @RequirePermissions('cms.write')
  deleteSection(@Param('id') id: string) {
    return this.prisma.homepageSection.delete({ where: { id } });
  }
}
