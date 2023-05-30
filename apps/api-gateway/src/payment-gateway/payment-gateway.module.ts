import { AuthModule } from '@/auth';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/http-session';
import { CardsController } from './controllers/cards.controller';
import { DepositController } from './controllers/deposit.controller';
import { ExternalBalanceController } from './controllers/external-balance.controller';
import { KYCController } from './controllers/kyc.controller';
import { MainController } from './controllers/main.controller';
import { SandboxGatewayController } from './controllers/sandbox-gateway.controller';
import { TransferController } from './controllers/transfer.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { WithdrawalController } from './controllers/withdrawal.controller';
import { CardsService } from './services/cards.service';
import { DepositService } from './services/deposit.service';
import { ExternalBalanceService } from './services/external-balance.service';
import { ExternalWithdrawService } from './services/external-withdraw.service';
import { KYCService } from './services/kyc.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { SandboxService } from './services/sandbox.service';

@Module({
  imports: [HttpModule, AuthModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [
    MainController,
    KYCController,
    DepositController,
    TransferController,
    WithdrawalController,
    SandboxGatewayController,
    WebhooksController,
    CardsController,
    ExternalBalanceController,
  ],
  providers: [
    PaymentGatewayService,
    SandboxService,
    DepositService,
    CardsService,
    ExternalBalanceService,
    KYCService,
    ExternalWithdrawService,
  ],
  exports: [PaymentGatewayService, ExternalBalanceService],
})
export class PaymentGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtSessionMiddleware)
      .forRoutes(
        MainController,
        KYCController,
        DepositController,
        TransferController,
        WithdrawalController,
        SandboxGatewayController,
        CardsController,
        ExternalBalanceController,
      );
  }
}
