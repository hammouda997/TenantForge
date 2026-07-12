import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { asJson } from '../common/utils/json';
import { CreateProjectDto, UpdateProjectDto } from '../common/dto/validation.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(orgId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { tasks: true } } },
      }),
      this.prisma.project.count({ where: { organizationId: orgId } }),
    ]);
    return { data, total };
  }

  async getById(orgId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(orgId: string, userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        description: dto.description,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'project.created',
      entityType: 'Project',
      entityId: project.id,
      metadata: { name: project.name },
    });

    return project;
  }

  async update(orgId: string, userId: string, projectId: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'project.updated',
      entityType: 'Project',
      entityId: projectId,
      metadata: asJson(dto as Record<string, unknown>),
    });

    return project;
  }

  async remove(orgId: string, userId: string, projectId: string) {
    const existing = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({ where: { id: projectId } });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'project.deleted',
      entityType: 'Project',
      entityId: projectId,
    });
  }
}
