import { NotificationEntity } from '@/notification/entities/notification.entity';
import { NotificationModule } from '@/notification/notification.module';
import { UserModule } from '@/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { asyncClientOptions } from '~common/grpc/helpers';
import { PaymentGatewayEntity } from '~svc/core/src/sdk/payment-gateway/entities/payment-gateway.entity';
import { BankAccountEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/bank-account.entity';
import { CardResourceEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/card-resource.entity';
import { ContributionEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/contribution.entity';
import { DepositParamsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/deposit-params.entity';
import { PrimeTrustAccountEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { TransferFundsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/transfer-funds.entity';
import { WithdrawalParamsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal.entity';
import { PaymentGatewayManager } from '~svc/core/src/sdk/payment-gateway/manager/payment-gateway.manager';
import { PrimeTrustHttpService } from '~svc/core/src/sdk/payment-gateway/request/prime-trust-http.service';
import { PaymentGatewayService } from '~svc/core/src/sdk/payment-gateway/services/payment.gateway.service';
import { PrimeAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeBankAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
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
      TransferFundsEntity,
      BankAccountEntity,
      DepositParamsEntity,
    ]),
    ClientsModule.registerAsync([asyncClientOptions('websocket')]),
    ClientsModule.registerAsync([asyncClientOptions('auth')]),
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
    PrimeBankAccountManager,
  ],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
