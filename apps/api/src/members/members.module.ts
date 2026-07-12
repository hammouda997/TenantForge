import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [AuditModule, NotificationsModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
