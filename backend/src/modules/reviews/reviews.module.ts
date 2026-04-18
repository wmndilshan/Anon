import { Module } from '@nestjs/common';
import { AdminReviewsController } from './admin-reviews.controller';
import { PublicReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [PublicReviewsController, AdminReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
