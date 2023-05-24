import { PaymentGatewayService } from '@/payment-gateway/services/payment-gateway.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/http-session';
import { AuthModule } from '../auth';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService, PaymentGatewayService],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(NotificationController);
  }
}
