import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware, SessionModule } from '~common/session';
import { SdkDepositController } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/controllers/sdk-deposit.controller';
import { SdkMainController } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/controllers/sdk-main.controller';
import { SdkSandboxGatewayController } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/controllers/sdk-sandbox-gateway.controller';
import { SdkTransferController } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/controllers/sdk-transfer.controller';
import { SdkWithdrawalController } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/controllers/sdk-withdrawal.controller';
import { SdkPaymentGatewayService } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';
import { SdkSandboxService } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/services/sdk-sandbox.service';

@Module({
  imports: [HttpModule, SessionModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [
    SdkMainController,
    SdkDepositController,
    SdkTransferController,
    SdkWithdrawalController,
    SdkSandboxGatewayController,
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
