import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewayCron } from '~svc/core/src/payment-gateway/cron/payment-gateway.cron';
import { PaymentGatewayManager } from '~svc/core/src/payment-gateway/manager/payment-gateway.manager';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/prime_trust/prime-trust.service';
import { PaymentGatewayService } from '~svc/core/src/payment-gateway/services/payment.gateway.service';
import { PrimeTrustAccountEntity } from '~svc/core/src/user/entities/prime-trust-account.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime-trust-user.entity';
import { UserModule } from '~svc/core/src/user/user.module';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime-trust-contact.entity';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([PrimeTrustUserEntity, PrimeTrustAccountEntity, PrimeTrustContactEntity]),
  ],
  providers: [PaymentGatewayService, PaymentGatewayManager, PrimeTrustService, PaymentGatewayCron],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
