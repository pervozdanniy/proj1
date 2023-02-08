import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/session';
import { NotificationController } from '~svc/api-gateway/src/api/notification/controllers/notification.controller';
import { NotificationService } from '~svc/api-gateway/src/api/notification/services/notification.service';
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
