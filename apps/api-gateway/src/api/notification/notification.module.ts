import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { NotificationController } from '~svc/api-gateway/src/api/notification/controllers/notification.controller';
import { NotificationService } from '~svc/api-gateway/src/api/notification/services/notification.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
