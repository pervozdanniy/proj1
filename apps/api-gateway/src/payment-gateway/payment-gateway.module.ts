import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware, SessionModule } from '~common/session';
import { SandboxGatewayController } from '~svc/api-gateway/src/payment-gateway/controllers/sandbox-gateway.controller';
import { PaymentGatewayService } from '~svc/api-gateway/src/payment-gateway/services/payment-gateway.service';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [HttpModule, SessionModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [PaymentGatewayController, SandboxGatewayController],
  providers: [PaymentGatewayService],
})
export class PaymentGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(PaymentGatewayController, SandboxGatewayController);
  }
}
