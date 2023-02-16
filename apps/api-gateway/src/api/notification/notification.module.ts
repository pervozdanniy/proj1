import { NotificationController } from '@/api/notification/controllers/notification.controller';
import { NotificationService } from '@/api/notification/services/notification.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/http-session';
import { AuthModule } from '../auth';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(NotificationController);
  }
}
