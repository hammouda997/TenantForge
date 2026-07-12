import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipRole } from '@prisma/client';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  PaginationDto,
  UpdateProjectDto,
} from '../common/dto/validation.dto';
import {
  CurrentOrg,
  CurrentUser,
  RequireRole,
} from '../common/decorators/tenant.decorators';
import { AuthUser } from '../auth/types/request-with-user';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../common/guards/tenant.guards';
import { paginate } from '../common/utils/pagination';

@ApiTags('projects')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: true })
@UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects in organization' })
  async list(@CurrentOrg() orgId: string, @Query() query: PaginationDto) {
    const { data, total } = await this.projectsService.list(orgId, query.page, query.limit);
    return paginate(data, total, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project with tasks' })
  getById(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.projectsService.getById(orgId, id);
  }

  @Post()
  @RequireRole(MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Create a project' })
  create(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(orgId, user.id, dto);
  }

  @Patch(':id')
  @RequireRole(MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Update a project' })
  update(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(orgId, user.id, id, dto);
  }

  @Delete(':id')
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Delete a project' })
  async remove(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.projectsService.remove(orgId, user.id, id);
  }
}
