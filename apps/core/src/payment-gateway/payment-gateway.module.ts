import { NotificationEntity } from '@/notification/entities/notification.entity';
import { NotificationModule } from '@/notification/notification.module';
import { UserModule } from '@/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { asyncClientOptions } from '~common/grpc/helpers';
import { CountryModule } from '../country/country.module';
import { DepositFlowController } from './controllers/deposit-flow.controller';
import { ExternalWithdrawAuthorizationController } from './controllers/external-withdraw-authorization.controller';
import { KYCController } from './controllers/kyc.controller';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';
import { WithdrawFlowController } from './controllers/withdraw-flow.controller';
import { DepositFlowEntity } from './entities/flow/deposit.entity';
import { BankAccountEntity } from './entities/prime_trust/bank-account.entity';
import { CardResourceEntity } from './entities/prime_trust/card-resource.entity';
import { DepositParamsEntity } from './entities/prime_trust/deposit-params.entity';
import { PrimeTrustAccountEntity } from './entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from './entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from './entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from './entities/prime_trust/prime-trust-kyc-document.entity';
import { WithdrawalParamsEntity } from './entities/prime_trust/withdrawal-params.entity';
import { TransfersEntity } from './entities/transfers.entity';
import { BrazilPaymentGateway } from './manager/countries/brazil-payment.gateway';
import { ChilePaymentGateway } from './manager/countries/chile-payment.gateway';
import { ColombiaPaymentGateway } from './manager/countries/colombia-payment.gateway';
import { MexicoPaymentGateway } from './manager/countries/mexico-payment.gateway';
import { PeruPaymentGateway } from './manager/countries/peru-payment.gateway';
import { USPaymentGateway } from './manager/countries/us-payment.gateway';
import { PaymentGatewayManager } from './manager/payment-gateway.manager';
import { FeeModule } from './modules/fee/fee.module';
import { InswitchModule } from './modules/inswitch/inswitch.module';
import { LiquidoWithdrawAuthorizationEntity } from './modules/liquido/entities/liquido_withdraw_authorization.entity';
import { VeriffModule } from './modules/veriff/veriff.module';
import { PrimeTrustHttpService } from './request/prime-trust-http.service';
import { CurrencyService } from './services/currency.service';
import { PrimeTrustClient } from './services/external-withdraw-authorization/prime-trust.client';
import { WithdrawAuthorizationService } from './services/external-withdraw-authorization/withdraw-authorization.service';
import { FacilitaService } from './services/facilita/facilita.service';
import { FacilitaDepositManager } from './services/facilita/managers/facilita-deposit.manager';
import { FacilitaMainManager } from './services/facilita/managers/facilita-main.manager';
import { FacilitaTokenManager } from './services/facilita/managers/facilita-token.manager';
import { FacilitaWebhookManager } from './services/facilita/managers/facilita-webhook.manager';
import { DepositFlow } from './services/flow/deposit-flow.service';
import { WithdrawFlowService } from './services/flow/withdraw-flow.service';
import { KoyweService } from './services/koywe/koywe.service';
import { KoyweBankAccountManager } from './services/koywe/managers/koywe-bank-account.manager';
import { KoyweDepositManager } from './services/koywe/managers/koywe-deposit.manager';
import { KoyweMainManager } from './services/koywe/managers/koywe-main.manager';
import { KoyweTokenManager } from './services/koywe/managers/koywe-token.manager';
import { KoyweWebhookManager } from './services/koywe/managers/koywe-webhook.manager';
import { KoyweWithdrawalManager } from './services/koywe/managers/koywe-withdrawal.manager';
import { KYCService } from './services/kyc/kyc.service';
import { LiquidoService } from './services/liquido/liquido.service';
import { LiquidoDepositManager } from './services/liquido/managers/liquido-deposit.manager';
import { LiquidoTokenManager } from './services/liquido/managers/liquido-token.manager';
import { LiquidoWebhookManager } from './services/liquido/managers/liquido-webhook.manager';
import { LiquidoWithdrawalManager } from './services/liquido/managers/liquido-withdrawal.manager';
import { BrazilPayoutService } from './services/liquido/payouts/brazil-payout.service';
import { ChilePayoutService } from './services/liquido/payouts/chile-payout.service';
import { MexicoPayoutService } from './services/liquido/payouts/mexico-payout.service';
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
import { PrimeLinkManager } from './services/prime_trust/managers/prime-link-manager';
import { PrimeTokenManager } from './services/prime_trust/managers/prime-token.manager';
import { PrimeTransactionsManager } from './services/prime_trust/managers/prime-transactions.manager';
import { PrimeWithdrawalManager } from './services/prime_trust/managers/prime-withdrawal.manager';
import { PrimeTrustService } from './services/prime_trust/prime-trust.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    NotificationModule,
    CountryModule,
    TypeOrmModule.forFeature([
      PrimeTrustAccountEntity,
      PrimeTrustContactEntity,
      PrimeTrustKycDocumentEntity,
      PrimeTrustBalanceEntity,
      WithdrawalParamsEntity,
      NotificationEntity,
      CardResourceEntity,
      TransfersEntity,
      BankAccountEntity,
      DepositParamsEntity,
      DepositFlowEntity,
      LiquidoWithdrawAuthorizationEntity,
    ]),
    ClientsModule.registerAsync([asyncClientOptions('auth')]),
    InswitchModule,
    VeriffModule,
    FeeModule,
  ],
  providers: [
    PaymentGatewayService,
    MainService,
    PaymentGatewayManager,
    PrimeTrustService,
    KoyweService,
    FacilitaService,
    FacilitaDepositManager,
    FacilitaWebhookManager,
    KoyweDepositManager,
    KoyweBankAccountManager,
    KoyweTokenManager,
    KoyweWithdrawalManager,
    KoyweWebhookManager,
    KoyweMainManager,
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
    PeruPaymentGateway,
    MexicoPaymentGateway,
    BrazilPaymentGateway,
    ColombiaPaymentGateway,
    CurrencyService,
    LiquidoService,
    LiquidoTokenManager,
    LiquidoWithdrawalManager,
    LiquidoWebhookManager,
    DepositFlow,
    WithdrawFlowService,
    PrimeLinkManager,
    LiquidoDepositManager,
    FacilitaTokenManager,
    WithdrawAuthorizationService,
    PrimeTrustClient,
    KYCService,
    FacilitaMainManager,
    MexicoPayoutService,
    BrazilPayoutService,
    ChilePayoutService,
  ],
  controllers: [
    PaymentGatewayController,
    DepositFlowController,
    WithdrawFlowController,
    KYCController,
    ExternalWithdrawAuthorizationController,
  ],
  exports: [PaymentGatewayService, CurrencyService],
})
export class PaymentGatewayModule {}
