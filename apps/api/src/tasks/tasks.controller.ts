import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipRole } from '@prisma/client';
import { TasksService } from './tasks.service';
import {
  CreateCommentDto,
  CreateTaskDto,
  UpdateTaskDto,
} from '../common/dto/validation.dto';
import {
  CurrentOrg,
  CurrentUser,
  RequireRole,
} from '../common/decorators/tenant.decorators';
import { AuthUser } from '../auth/types/request-with-user';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../common/guards/tenant.guards';

@ApiTags('tasks')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: true })
@UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequireRole(MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Create a task in project' })
  create(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(orgId, user.id, projectId, dto);
  }

  @Patch(':taskId')
  @RequireRole(MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Update a task' })
  update(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(orgId, user.id, projectId, taskId, dto);
  }

  @Delete(':taskId')
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Delete a task' })
  async remove(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    await this.tasksService.remove(orgId, user.id, projectId, taskId);
  }

  @Post(':taskId/comments')
  @RequireRole(MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Add comment to task' })
  addComment(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.tasksService.addComment(orgId, user.id, projectId, taskId, dto);
  }
}
