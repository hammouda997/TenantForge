import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { RequestWithUser } from '../../auth/types/request-with-user';
import { ORG_HEADER, ROLES_KEY } from '../decorators/tenant.decorators';

const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }
    return true;
  }
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const orgId = request.headers[ORG_HEADER] as string | undefined;
    if (!orgId) {
      throw new ForbiddenException('Organization header required');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: request.user.id,
          organizationId: orgId,
        },
      },
      include: { organization: true },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this organization');
    }

    request.organizationId = orgId;
    request.membership = membership;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const membership = request.membership;

    if (!membership) {
      throw new ForbiddenException('Organization context required');
    }

    const userLevel = ROLE_HIERARCHY[membership.role];
    const requiredLevel = Math.min(...requiredRoles.map((role) => ROLE_HIERARCHY[role]));

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
