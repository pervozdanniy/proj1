import { AuthModule } from '@/auth';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/http-session';
import { DepositController } from './controllers/deposit.controller';
import { LinkController } from './controllers/link.controller';
import { MainController } from './controllers/main.controller';
import { SandboxGatewayController } from './controllers/sandbox-gateway.controller';
import { TransferController } from './controllers/transfer.controller';
import { VeriffController } from './controllers/veriff.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { WithdrawalController } from './controllers/withdrawal.controller';
import { DepositService } from './services/deposit.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { SandboxService } from './services/sandbox.service';

@Module({
  imports: [HttpModule, AuthModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [
    MainController,
    VeriffController,
    DepositController,
    TransferController,
    WithdrawalController,
    SandboxGatewayController,
    WebhooksController,
    LinkController,
  ],
  providers: [PaymentGatewayService, SandboxService, DepositService],
})
export class PrimeTrustModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtSessionMiddleware)
      .forRoutes(
        MainController,
        VeriffController,
        DepositController,
        TransferController,
        WithdrawalController,
        SandboxGatewayController,
        LinkController,
      );
  }
}
