import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipRole } from '@prisma/client';
import { AuditService } from './audit.service';
import { CurrentOrg, RequireRole } from '../common/decorators/tenant.decorators';
import { PaginationDto } from '../common/dto/validation.dto';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../common/guards/tenant.guards';
import { paginate } from '../common/utils/pagination';

@ApiTags('audit')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: true })
@UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'List organization audit logs' })
  async list(@CurrentOrg() orgId: string, @Query() query: PaginationDto) {
    const { data, total } = await this.auditService.findByOrganization(
      orgId,
      query.page,
      query.limit,
    );
    return paginate(data, total, query.page, query.limit);
  }
}
