import { SdkDepositController } from '@/sdk/payment-gateway/prime_trust/controllers/sdk-deposit.controller';
import { SdkMainController } from '@/sdk/payment-gateway/prime_trust/controllers/sdk-main.controller';
import { SdkSandboxGatewayController } from '@/sdk/payment-gateway/prime_trust/controllers/sdk-sandbox-gateway.controller';
import { SdkTransferController } from '@/sdk/payment-gateway/prime_trust/controllers/sdk-transfer.controller';
import { SdkWithdrawalController } from '@/sdk/payment-gateway/prime_trust/controllers/sdk-withdrawal.controller';
import { SdkPaymentGatewayService } from '@/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';
import { SdkSandboxService } from '@/sdk/payment-gateway/prime_trust/services/sdk-sandbox.service';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { HttpSessionModule, JwtSessionMiddleware } from '~common/http-session';
import { SdkWebhooksController } from './controllers/sdk-webhooks.controller';

@Module({
  imports: [HttpModule, HttpSessionModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [
    SdkMainController,
    SdkDepositController,
    SdkTransferController,
    SdkWithdrawalController,
    SdkSandboxGatewayController,
    SdkWebhooksController,
  ],
  providers: [SdkPaymentGatewayService, SdkSandboxService],
})
export class SdkPrimeTrustModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtSessionMiddleware)
      .forRoutes(
        SdkMainController,
        SdkDepositController,
        SdkTransferController,
        SdkWithdrawalController,
        SdkSandboxGatewayController,
      );
  }
}
