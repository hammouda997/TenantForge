import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { asJson } from '../common/utils/json';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../common/dto/validation.dto';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listForUser(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            subscription: true,
            _count: { select: { memberships: true, projects: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
      subscription: m.organization.subscription,
      memberCount: m.organization._count.memberships,
      projectCount: m.organization._count.projects,
    }));
  }

  async create(userId: string, dto: CreateOrganizationDto) {
    const slug = dto.slug;
    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    const organization = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: dto.name, slug },
      });

      await tx.membership.create({
        data: {
          userId,
          organizationId: org.id,
          role: MembershipRole.OWNER,
        },
      });

      await tx.subscription.create({ data: { organizationId: org.id } });
      return org;
    });

    await this.auditService.log({
      organizationId: organization.id,
      actorId: userId,
      action: 'organization.created',
      entityType: 'Organization',
      entityId: organization.id,
      metadata: { name: organization.name, slug: organization.slug },
    });

    return organization;
  }

  async getById(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscription: { include: { invoices: { orderBy: { createdAt: 'desc' }, take: 5 } } },
        _count: { select: { memberships: true, projects: true } },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async update(orgId: string, userId: string, dto: UpdateOrganizationDto) {
    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: dto,
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'organization.updated',
      entityType: 'Organization',
      entityId: orgId,
      metadata: asJson(dto as Record<string, unknown>),
    });

    return org;
  }
}
