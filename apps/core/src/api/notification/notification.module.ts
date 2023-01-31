import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { asyncClientOptions } from '~common/grpc/helpers';
import { NotificationController } from '~svc/core/src/api/notification/controllers/notification.controller';
import { NotificationEntity } from '~svc/core/src/api/notification/entities/notification.entity';
import { NotificationService } from '~svc/core/src/api/notification/services/notification.service';
import { UserModule } from '~svc/core/src/api/user/user.module';

@Module({
  imports: [
    UserModule,
    ClientsModule.registerAsync([asyncClientOptions('notifier')]),
    TypeOrmModule.forFeature([NotificationEntity]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
