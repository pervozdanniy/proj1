import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '~svc/core/src/api/notification/entities/notification.entity';
import { NotificationModule } from '~svc/core/src/api/notification/notification.module';
import { UserModule } from '~svc/core/src/api/user/user.module';
import { PaymentGatewayEntity } from '~svc/core/src/sdk/payment-gateway/entities/payment-gateway.entity';
import { CardResourceEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/card-resource.entity';
import { ContributionEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/contribution.entity';
import { PrimeTrustAccountEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { WithdrawalParamsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal.entity';
import { PaymentGatewayManager } from '~svc/core/src/sdk/payment-gateway/manager/payment-gateway.manager';
import { PrimeTrustHttpService } from '~svc/core/src/sdk/payment-gateway/request/prime-trust-http.service';
import { PaymentGatewayService } from '~svc/core/src/sdk/payment-gateway/services/payment.gateway.service';
import { PrimeAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeKycManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeTransactionsManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-transactions.manager';
import { PrimeTrustService } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/prime-trust.service';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [
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
      CardResourceEntity,
    ]),
  ],
  providers: [
    PaymentGatewayService,
    PaymentGatewayManager,
    PrimeTrustService,
    PrimeTokenManager,
    PrimeAccountManager,
    PrimeKycManager,
    PrimeTransactionsManager,
    PrimeTrustHttpService,
  ],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
