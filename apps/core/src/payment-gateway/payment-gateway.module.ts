import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrimeTrustHttpService } from '~common/axios/prime-trust-http.service';
import { createBullQueue } from '~common/grpc/helpers';
import { NotificationEntity } from '~svc/core/src/notification/entities/notification.entity';
import { NotificationModule } from '~svc/core/src/notification/notification.module';
import { PaymentGatewayEntity } from '~svc/core/src/payment-gateway/entities/payment-gateway.entity';
import { ContributionEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/contribution.entity';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { WithdrawalParamsEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/withdrawal.entity';
import { PaymentGatewayManager } from '~svc/core/src/payment-gateway/manager/payment-gateway.manager';
import { PaymentGatewayService } from '~svc/core/src/payment-gateway/services/payment.gateway.service';
import { PrimeAccountManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeKycManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeWireManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-wire.manager';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/services/prime_trust/prime-trust.service';
import { UserModule } from '~svc/core/src/user/user.module';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [
    BullModule.registerQueueAsync(createBullQueue('users_registration', 'user_registration')),
    HttpModule,
    UserModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      PaymentGatewayEntity,
      PrimeTrustAccountEntity,
      PrimeTrustContactEntity,
      PrimeTrustKycDocumentEntity,
      PrimeTrustBalanceEntity,
      WithdrawalParamsEntity,
      WithdrawalEntity,
      NotificationEntity,
      ContributionEntity,
    ]),
  ],
  providers: [
    PaymentGatewayService,
    PaymentGatewayManager,
    PrimeTrustService,
    PrimeTokenManager,
    PrimeAccountManager,
    PrimeKycManager,
    PrimeWireManager,
    PrimeTrustHttpService,
  ],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
