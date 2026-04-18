import { UserType } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  userType: UserType;
  permissions: string[];
};
