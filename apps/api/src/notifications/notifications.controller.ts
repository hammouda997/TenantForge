import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentOrg, CurrentUser } from '../common/decorators/tenant.decorators';
import { PaginationDto } from '../common/dto/validation.dto';
import { AuthUser } from '../auth/types/request-with-user';
import { JwtAuthGuard, TenantGuard } from '../common/guards/tenant.guards';
import { paginate } from '../common/utils/pagination';

@ApiTags('notifications')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', required: true })
@UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user in organization' })
  async list(
    @CurrentUser() user: AuthUser,
    @CurrentOrg() orgId: string,
    @Query() query: PaginationDto,
  ) {
    const result = await this.notificationsService.listForUser(
      user.id,
      orgId,
      query.page,
      query.limit,
    );
    return {
      ...paginate(result.data, result.total, query.page, query.limit),
      unreadCount: result.unreadCount,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notificationsService.markRead(user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser() user: AuthUser, @CurrentOrg() orgId: string) {
    return this.notificationsService.markAllRead(user.id, orgId);
  }
}
