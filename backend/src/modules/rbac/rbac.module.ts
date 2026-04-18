import { Module } from '@nestjs/common';
import { AdminRbacController } from './admin-rbac.controller';

@Module({
  controllers: [AdminRbacController],
})
export class RbacModule {}
