import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { asJson } from '../common/utils/json';
import {
  CreateCommentDto,
  CreateTaskDto,
  UpdateTaskDto,
} from '../common/dto/validation.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async assertProjectInOrg(orgId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(orgId: string, userId: string, projectId: string, dto: CreateTaskDto) {
    await this.assertProjectInOrg(orgId, projectId);

    const task = await this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        assigneeId: dto.assigneeId,
        status: dto.status,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'task.created',
      entityType: 'Task',
      entityId: task.id,
      metadata: { projectId, title: task.title },
    });

    if (dto.assigneeId && dto.assigneeId !== userId) {
      await this.notificationsService.create({
        userId: dto.assigneeId,
        organizationId: orgId,
        title: 'Task assigned',
        message: `You were assigned: ${task.title}`,
      });
    }

    return task;
  }

  async update(
    orgId: string,
    userId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertProjectInOrg(orgId, projectId);

    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: dto,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'task.updated',
      entityType: 'Task',
      entityId: taskId,
      metadata: asJson(dto as Record<string, unknown>),
    });

    if (dto.assigneeId && dto.assigneeId !== existing.assigneeId) {
      await this.notificationsService.create({
        userId: dto.assigneeId,
        organizationId: orgId,
        title: 'Task assigned',
        message: `You were assigned: ${task.title}`,
      });
    }

    return task;
  }

  async remove(orgId: string, userId: string, projectId: string, taskId: string) {
    await this.assertProjectInOrg(orgId, projectId);

    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({ where: { id: taskId } });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'task.deleted',
      entityType: 'Task',
      entityId: taskId,
    });
  }

  async addComment(
    orgId: string,
    userId: string,
    projectId: string,
    taskId: string,
    dto: CreateCommentDto,
  ) {
    await this.assertProjectInOrg(orgId, projectId);

    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: { assignee: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        content: dto.content,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'comment.created',
      entityType: 'Comment',
      entityId: comment.id,
      metadata: { taskId },
    });

    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notificationsService.create({
        userId: task.assigneeId,
        organizationId: orgId,
        title: 'New comment',
        message: `New comment on: ${task.title}`,
      });
    }

    return comment;
  }
}
