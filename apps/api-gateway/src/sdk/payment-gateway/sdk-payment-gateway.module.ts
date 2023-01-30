import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware, SessionModule } from '~common/session';
import { SdkPaymentGatewayController } from '~svc/api-gateway/src/sdk/payment-gateway/controllers/sdk-payment-gateway.controller';
import { SdkSandboxGatewayController } from '~svc/api-gateway/src/sdk/payment-gateway/controllers/sdk-sandbox-gateway.controller';
import { SdkPaymentGatewayService } from '~svc/api-gateway/src/sdk/payment-gateway/services/sdk-payment-gateway.service';
import { SdkSandboxService } from '~svc/api-gateway/src/sdk/payment-gateway/services/sdk-sandbox.service';

@Module({
  imports: [HttpModule, SessionModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [SdkPaymentGatewayController, SdkSandboxGatewayController],
  providers: [SdkPaymentGatewayService, SdkSandboxService],
})
export class SdkPaymentGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(SdkPaymentGatewayController, SdkSandboxGatewayController);
  }
}
