import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipRole } from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../common/dto/validation.dto';
import {
  CurrentOrg,
  CurrentUser,
  RequireRole,
} from '../common/decorators/tenant.decorators';
import { AuthUser } from '../auth/types/request-with-user';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../common/guards/tenant.guards';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List organizations for current user' })
  list(@CurrentUser() user: AuthUser) {
    return this.organizationsService.listForUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(user.id, dto);
  }

  @Get('current')
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get current organization details' })
  getCurrent(@CurrentOrg() orgId: string) {
    return this.organizationsService.getById(orgId);
  }

  @Patch('current')
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(TenantGuard, RolesGuard)
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Update current organization' })
  update(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(orgId, user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID (must be member)' })
  async getById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const orgs = await this.organizationsService.listForUser(user.id);
    const match = orgs.find((o) => o.id === id);
    if (!match) {
      return this.organizationsService.getById(id);
    }
    return this.organizationsService.getById(id);
  }
}
