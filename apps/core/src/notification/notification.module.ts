import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { asyncClientOptions } from '~common/grpc/helpers';
import { NotificationController } from './controllers/notification.controller';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';

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
