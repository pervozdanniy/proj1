import { AuthModule } from '@/api/auth';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/session';
import { DepositController } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/controllers/deposit.controller';
import { MainController } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/controllers/main.controller';
import { SandboxGatewayController } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/controllers/sandbox-gateway.controller';
import { TransferController } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/controllers/transfer.controller';
import { WithdrawalController } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/controllers/withdrawal.controller';
import { PaymentGatewayService } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/services/payment-gateway.service';
import { SandboxService } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/services/sandbox.service';

@Module({
  imports: [HttpModule, AuthModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [MainController, DepositController, TransferController, WithdrawalController, SandboxGatewayController],
  providers: [PaymentGatewayService, SandboxService],
})
export class PrimeTrustModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtSessionMiddleware)
      .forRoutes(MainController, DepositController, TransferController, WithdrawalController, SandboxGatewayController);
  }
}
