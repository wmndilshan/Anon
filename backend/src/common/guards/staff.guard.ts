import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { JwtPayload } from '../../modules/auth/auth.types';

@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;
    if (!user || user.userType !== UserType.STAFF) {
      throw new ForbiddenException('Staff access required');
    }
    return true;
  }
}
