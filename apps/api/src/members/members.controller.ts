import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipRole } from '@prisma/client';
import { MembersService } from './members.service';
import { InviteMemberDto, UpdateMemberRoleDto } from '../common/dto/validation.dto';
import {
  CurrentOrg,
  CurrentUser,
  RequireRole,
} from '../common/decorators/tenant.decorators';
import { AuthUser } from '../auth/types/request-with-user';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../common/guards/tenant.guards';

@ApiTags('members')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: true })
@UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List organization members' })
  list(@CurrentOrg() orgId: string) {
    return this.membersService.list(orgId);
  }

  @Post('invite')
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Invite a member to the organization' })
  invite(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: InviteMemberDto,
  ) {
    return this.membersService.invite(orgId, user.id, dto);
  }

  @Patch(':id/role')
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Update member role' })
  updateRole(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateRole(orgId, user.id, id, dto);
  }

  @Delete(':id')
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Remove a member' })
  async remove(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.membersService.remove(orgId, user.id, id);
  }
}
