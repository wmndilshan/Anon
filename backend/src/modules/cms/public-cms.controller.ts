import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('cms')
@Controller('cms')
export class PublicCmsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('pages/:slug')
  async page(@Param('slug') slug: string) {
    const row = await this.prisma.cmsPage.findUnique({ where: { slug } });
    if (!row || !row.isPublished) throw new NotFoundException('Page not found');
    return row;
  }

  @Get('layout')
  async layout() {
    const keys = ['footer', 'contact', 'announcement', 'seo_default'];
    const rows = await this.prisma.siteSetting.findMany({ where: { key: { in: keys } } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }
}
