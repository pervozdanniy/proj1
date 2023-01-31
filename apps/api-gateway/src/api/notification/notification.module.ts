import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware, SessionModule } from '~common/session';
import { NotificationController } from '~svc/api-gateway/src/api/notification/controllers/notification.controller';
import { NotificationService } from '~svc/api-gateway/src/api/notification/services/notification.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), SessionModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(NotificationController);
  }
}
