import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { JsonValue } from '../common/utils/json';

export interface AuditLogInput {
  organizationId: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: JsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
      },
    });
  }

  async findByOrganization(organizationId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where: { organizationId } }),
    ]);
    return { data, total };
  }
}
