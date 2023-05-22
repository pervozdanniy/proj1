import { IdRequest, SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import {
  AccountStatusResponse,
  AgreementRequest,
  BalanceRequest,
  BalanceResponse,
  BankAccountParams,
  BankAccountsResponse,
  BanksInfoResponse,
  ContactResponse,
  CreditCardResourceResponse,
  ExchangeRequest,
  ExchangeResponse,
  FacilitaWebhookRequest,
  KoyweWebhookRequest,
  LinkWebhookRequest,
  LiquidoWebhookRequest,
  PaymentGatewayServiceController,
  PaymentGatewayServiceControllerMethods,
  PaymentMethodsResponse,
  PrimeWebhookRequest,
  SearchTransactionRequest,
  TransactionResponse,
  TransferFundsRequest,
  TransferFundsResponse,
  TransferInfo,
  TransferMethodRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { VeriffHookRequest, VeriffSessionResponse, WebhookResponse } from '~common/grpc/interfaces/veriff';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { MainService } from '../services/main.service';
import { PaymentGatewayWebhooksService } from '../services/payment-gateway-webhooks.service';
import { PaymentGatewayService } from '../services/payment-gateway.service';

@RpcController()
@PaymentGatewayServiceControllerMethods()
export class PaymentGatewayController implements PaymentGatewayServiceController {
  linkHandler(request: LinkWebhookRequest): Promise<SuccessResponse> {
    return this.webhooksService.linkWebhookHandler(request);
  }
  constructor(
    private mainService: MainService,
    private paymentGatewayService: PaymentGatewayService,
    private webhooksService: PaymentGatewayWebhooksService,
  ) {}

  getAvailablePaymentMethods({ id }: UserIdRequest): Promise<PaymentMethodsResponse> {
    return this.mainService.getAvailablePaymentMethods(id);
  }

  primeWebhooksHandler(request: PrimeWebhookRequest): Promise<SuccessResponse> {
    return this.webhooksService.primeWebhooksHandler(request);
  }

  getBalance(request: BalanceRequest): Promise<BalanceResponse> {
    return this.paymentGatewayService.getBalance(request);
  }

  makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    return this.mainService.makeWithdrawal(request);
  }

  verifyCreditCard(request: VerifyCreditCardRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.verifyCreditCard(request);
  }

  transferFunds(request: TransferFundsRequest): Promise<TransferFundsResponse> {
    return this.paymentGatewayService.transferFunds(request);
  }

  getBankAccounts(request: UserIdRequest): Promise<BankAccountsResponse> {
    return this.paymentGatewayService.getBankAccounts(request);
  }

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.mainService.addBankAccountParams(request);
  }

  getBanksInfo(request: UserIdRequest): Promise<BanksInfoResponse> {
    return this.mainService.getBanksInfo(request);
  }

  getTransactions(request: SearchTransactionRequest): Promise<TransactionResponse> {
    return this.paymentGatewayService.getTransactions(request);
  }

  getContact({ id }: UserIdRequest): Promise<ContactResponse> {
    return this.paymentGatewayService.getContact(id);
  }

  createCreditCardResource({ id }: UserIdRequest): Promise<CreditCardResourceResponse> {
    return this.paymentGatewayService.createCreditCardResource(id);
  }

  koyweWebhooksHandler(request: KoyweWebhookRequest): Promise<SuccessResponse> {
    return this.webhooksService.koyweWebhooksHandler(request);
  }

  getUserAccountStatus(request: IdRequest): Promise<AccountStatusResponse> {
    return this.paymentGatewayService.getUserAccountStatus(request);
  }

  createAgreement(request: AgreementRequest): Promise<UserAgreement> {
    return this.paymentGatewayService.createAgreement(request);
  }

  exchange(request: ExchangeRequest): Promise<ExchangeResponse> {
    return this.paymentGatewayService.exchange(request);
  }

  transferToHotWallet(): Promise<SuccessResponse> {
    return this.paymentGatewayService.transferToHotWallet();
  }
  facilitaWebhooksHandler(request: FacilitaWebhookRequest): Promise<SuccessResponse> {
    return this.webhooksService.facilitaWebhooksHandler(request);
  }

  liquidoWebhooksHandler(request: LiquidoWebhookRequest): Promise<SuccessResponse> {
    return this.webhooksService.liquidoWebhooksHandler(request);
  }

  generateVeriffLink({ id }: UserIdRequest): Promise<VeriffSessionResponse> {
    return this.paymentGatewayService.generateVeriffLink(id);
  }

  veriffHookHandler(request: VeriffHookRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.veriffHookHandler(request);
  }

  veriffWebhookHandler(request: WebhookResponse): Promise<SuccessResponse> {
    return this.paymentGatewayService.veriffWebhookHandler(request);
  }
}
