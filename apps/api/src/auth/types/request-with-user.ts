import { Membership, User } from '@prisma/client';
import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface RequestWithUser extends Request {
  user?: AuthUser;
  organizationId?: string;
  membership?: Membership & { organization?: { id: string; name: string; slug: string } };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: AuthUser;
}
