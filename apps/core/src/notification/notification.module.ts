import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from '~svc/core/src/notification/controllers/notification.controller';
import { NotificationEntity } from '~svc/core/src/notification/entities/notification.entity';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
