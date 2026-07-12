import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { RequestWithUser } from '../../auth/types/request-with-user';

export const ROLES_KEY = 'roles';
export const RequireRole = (...roles: MembershipRole[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

export const CurrentOrg = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.organizationId;
  },
);

export const CurrentMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.membership;
  },
);

export const ORG_HEADER = 'x-organization-id';
