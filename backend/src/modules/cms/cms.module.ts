import { Module } from '@nestjs/common';
import { AdminCmsController } from './admin-cms.controller';
import { PublicCmsController } from './public-cms.controller';

@Module({
  controllers: [PublicCmsController, AdminCmsController],
})
export class CmsModule {}
