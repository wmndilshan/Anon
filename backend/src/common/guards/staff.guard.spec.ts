import { ForbiddenException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { StaffGuard } from './staff.guard';

function makeContext(user: object | undefined) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as any;
}

describe('StaffGuard', () => {
  let guard: StaffGuard;

  beforeEach(() => {
    guard = new StaffGuard();
  });

  it('allows STAFF users', () => {
    const user = { sub: '1', email: 'a@b.com', userType: UserType.STAFF, permissions: [] };
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });

  it('throws ForbiddenException for CUSTOMER users', () => {
    const user = { sub: '1', email: 'a@b.com', userType: UserType.CUSTOMER, permissions: [] };
    expect(() => guard.canActivate(makeContext(user))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is undefined', () => {
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });
});
