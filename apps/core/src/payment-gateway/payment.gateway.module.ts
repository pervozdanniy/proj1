import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './controllers/payment.gateway.controller';
import { UserModule } from '~svc/core/src/user/user.module';
import { PaymentGatewayService } from '~svc/core/src/payment-gateway/services/payment.gateway.service';
import { HttpModule } from '@nestjs/axios';
import { PaymentGatewayManager } from '~svc/core/src/payment-gateway/manager/payment.gateway.manager';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/prime_trust/prime.trust.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { PaymentGatewayCron } from '~svc/core/src/payment-gateway/cron/payment.gateway.cron';

@Module({
  imports: [HttpModule, UserModule, TypeOrmModule.forFeature([PrimeTrustUserEntity])],
  providers: [PaymentGatewayService, PaymentGatewayManager, PrimeTrustService, PaymentGatewayCron],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
