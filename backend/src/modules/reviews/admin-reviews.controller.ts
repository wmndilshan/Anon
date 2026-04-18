import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { ReviewsService } from './reviews.service';

@ApiTags('admin-reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @RequirePermissions('reviews.moderate')
  list(@Query('status') status?: ReviewStatus, @Query('page') page?: string, @Query('pageSize') ps?: string) {
    return this.reviews.adminList(
      status,
      page ? parseInt(page, 10) : 1,
      ps ? parseInt(ps, 10) : 20,
    );
  }

  @Patch(':id')
  @RequirePermissions('reviews.moderate')
  moderate(@Param('id') id: string, @Body() body: { status: ReviewStatus }) {
    return this.reviews.moderate(id, body.status);
  }
}
