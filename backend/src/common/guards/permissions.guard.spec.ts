import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { PermissionsGuard } from './permissions.guard';

function makeContext(user: object | undefined, handler: object = {}, cls: object = {}) {
  return {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as any;
}

describe('PermissionsGuard', () => {
  let reflector: Reflector;
  let guard: PermissionsGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new PermissionsGuard(reflector);
  });

  it('allows access when no permissions are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(makeContext(undefined))).toBe(true);
  });

  it('allows access when required permissions array is empty', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);
    expect(guard.canActivate(makeContext(undefined))).toBe(true);
  });

  it('throws ForbiddenException when user has no permissions', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['products.read']);
    const user = { sub: '1', email: 'a@b.com', userType: UserType.STAFF, permissions: [] };
    expect(() => guard.canActivate(makeContext(user))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is missing', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['products.read']);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user lacks the required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['orders.manage']);
    const user = {
      sub: '1',
      email: 'a@b.com',
      userType: UserType.STAFF,
      permissions: ['products.read'],
    };
    expect(() => guard.canActivate(makeContext(user))).toThrow(ForbiddenException);
  });

  it('allows access when user has the exact required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['products.read']);
    const user = {
      sub: '1',
      email: 'a@b.com',
      userType: UserType.STAFF,
      permissions: ['products.read'],
    };
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });

  it('allows access when user has wildcard permission "*"', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['orders.manage']);
    const user = {
      sub: '1',
      email: 'a@b.com',
      userType: UserType.STAFF,
      permissions: ['*'],
    };
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });

  it('allows access when user has all required permissions', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['products.read', 'orders.manage']);
    const user = {
      sub: '1',
      email: 'a@b.com',
      userType: UserType.STAFF,
      permissions: ['products.read', 'orders.manage'],
    };
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });
});
