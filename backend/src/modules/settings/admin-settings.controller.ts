import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('admin-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('settings.write')
  async list() {
    return this.prisma.siteSetting.findMany();
  }

  @Put(':key')
  @RequirePermissions('settings.write')
  async put(@Param('key') key: string, @Body() body: { value: Record<string, unknown> }) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: body.value },
      update: { value: body.value },
    });
  }
}
