import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewayCron } from '~svc/core/src/payment-gateway/cron/payment-gateway.cron';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { PaymentGatewayManager } from '~svc/core/src/payment-gateway/manager/payment-gateway.manager';
import { PaymentGatewayService } from '~svc/core/src/payment-gateway/services/payment.gateway.service';
import { PrimeAccountManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeKycManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeUserManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-user-manager';
import { PrimeWireManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-wire.manager';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/services/prime_trust/prime-trust.service';
import { UserModule } from '~svc/core/src/user/user.module';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'failed',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      },
    }),
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      PrimeTrustUserEntity,
      PrimeTrustAccountEntity,
      PrimeTrustContactEntity,
      PrimeTrustKycDocumentEntity,
    ]),
  ],
  providers: [
    PaymentGatewayService,
    PaymentGatewayManager,
    PrimeTrustService,
    PaymentGatewayCron,
    PrimeTokenManager,
    PrimeUserManager,
    PrimeAccountManager,
    PrimeKycManager,
    PrimeWireManager,
  ],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
