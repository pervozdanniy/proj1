import { NotificationEntity } from '@/notification/entities/notification.entity';
import { NotificationModule } from '@/notification/notification.module';
import { UserModule } from '@/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { asyncClientOptions } from '~common/grpc/helpers';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';
import { PaymentGatewayEntity } from './entities/payment-gateway.entity';
import { BankAccountEntity } from './entities/prime_trust/bank-account.entity';
import { CardResourceEntity } from './entities/prime_trust/card-resource.entity';
import { ContributionEntity } from './entities/prime_trust/contribution.entity';
import { DepositParamsEntity } from './entities/prime_trust/deposit-params.entity';
import { PrimeTrustAccountEntity } from './entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from './entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from './entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from './entities/prime_trust/prime-trust-kyc-document.entity';
import { TransfersEntity } from './entities/prime_trust/transfers.entity';
import { WithdrawalParamsEntity } from './entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from './entities/prime_trust/withdrawal.entity';
import { ChilePaymentGateway } from './manager/countries/chile-payment.gateway';
import { USPaymentGateway } from './manager/countries/us-payment.gateway';
import { PaymentGatewayManager } from './manager/payment-gateway.manager';
import { PrimeTrustHttpService } from './request/prime-trust-http.service';
import { KoyweService } from './services/koywe/koywe.service';
import { KoyweBankAccountManager } from './services/koywe/managers/koywe-bank-account.manager';
import { KoyweDepositManager } from './services/koywe/managers/koywe-deposit.manager';
import { KoyweTokenManager } from './services/koywe/managers/koywe-token.manager';
import { KoyweWithdrawalManager } from './services/koywe/managers/koywe-withdrawal.manager';
import { MainService } from './services/main.service';
import { PaymentGatewayWebhooksService } from './services/payment-gateway-webhooks.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { PrimeAccountManager } from './services/prime_trust/managers/prime-account.manager';
import { PrimeAssetsManager } from './services/prime_trust/managers/prime-assets.manager';
import { PrimeBalanceManager } from './services/prime_trust/managers/prime-balance.manager';
import { PrimeBankAccountManager } from './services/prime_trust/managers/prime-bank-account.manager';
import { PrimeDepositManager } from './services/prime_trust/managers/prime-deposit.manager';
import { PrimeFundsTransferManager } from './services/prime_trust/managers/prime-funds-transfer.manager';
import { PrimeKycManager } from './services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from './services/prime_trust/managers/prime-token.manager';
import { PrimeTransactionsManager } from './services/prime_trust/managers/prime-transactions.manager';
import { PrimeWithdrawalManager } from './services/prime_trust/managers/prime-withdrawal.manager';
import { PrimeTrustService } from './services/prime_trust/prime-trust.service';

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
      TransfersEntity,
      BankAccountEntity,
      DepositParamsEntity,
    ]),
    ClientsModule.registerAsync([asyncClientOptions('websocket')]),
    ClientsModule.registerAsync([asyncClientOptions('auth')]),
  ],
  providers: [
    PaymentGatewayService,
    MainService,
    PaymentGatewayManager,
    PrimeTrustService,
    KoyweService,
    KoyweDepositManager,
    KoyweBankAccountManager,
    KoyweTokenManager,
    KoyweWithdrawalManager,
    PaymentGatewayWebhooksService,
    PrimeTokenManager,
    PrimeAccountManager,
    PrimeKycManager,
    PrimeBalanceManager,
    PrimeDepositManager,
    PrimeFundsTransferManager,
    PrimeWithdrawalManager,
    PrimeTrustHttpService,
    PrimeBankAccountManager,
    PrimeTransactionsManager,
    PrimeAssetsManager,
    USPaymentGateway,
    ChilePaymentGateway,
  ],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
