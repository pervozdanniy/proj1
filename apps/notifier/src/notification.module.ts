import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration], isGlobal: true })],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
