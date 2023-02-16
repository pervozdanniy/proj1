import { AuthModule } from '@/api/auth';
import { DepositController } from '@/api/payment-gateway/prime_trust/controllers/deposit.controller';
import { MainController } from '@/api/payment-gateway/prime_trust/controllers/main.controller';
import { SandboxGatewayController } from '@/api/payment-gateway/prime_trust/controllers/sandbox-gateway.controller';
import { TransferController } from '@/api/payment-gateway/prime_trust/controllers/transfer.controller';
import { WithdrawalController } from '@/api/payment-gateway/prime_trust/controllers/withdrawal.controller';
import { PaymentGatewayService } from '@/api/payment-gateway/prime_trust/services/payment-gateway.service';
import { SandboxService } from '@/api/payment-gateway/prime_trust/services/sandbox.service';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/http-session';

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
