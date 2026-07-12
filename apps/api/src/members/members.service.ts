import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InviteMemberDto, UpdateMemberRoleDto } from '../common/dto/validation.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(orgId: string) {
    return this.prisma.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async invite(orgId: string, actorId: string, dto: InviteMemberDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('User not found. They must register first.');
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
    });
    if (existing) {
      throw new ConflictException('User is already a member');
    }

    const membership = await this.prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: orgId,
        role: dto.role,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId,
      action: 'member.invited',
      entityType: 'Membership',
      entityId: membership.id,
      metadata: { email: dto.email, role: dto.role },
    });

    await this.notificationsService.create({
      userId: user.id,
      organizationId: orgId,
      title: 'Organization invitation',
      message: 'You have been added to an organization.',
    });

    return membership;
  }

  async updateRole(
    orgId: string,
    actorId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, organizationId: orgId },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new BadRequestException('Cannot change owner role');
    }

    const updated = await this.prisma.membership.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId,
      action: 'member.role_updated',
      entityType: 'Membership',
      entityId: memberId,
      metadata: { role: dto.role },
    });

    return updated;
  }

  async remove(orgId: string, actorId: string, memberId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, organizationId: orgId },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new BadRequestException('Cannot remove organization owner');
    }

    await this.prisma.membership.delete({ where: { id: memberId } });

    await this.auditService.log({
      organizationId: orgId,
      actorId,
      action: 'member.removed',
      entityType: 'Membership',
      entityId: memberId,
    });
  }
}
