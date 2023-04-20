import { IdRequest, SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  AccountResponse,
  AccountStatusResponse,
  AgreementRequest,
  BalanceRequest,
  BalanceResponse,
  BankAccountParams,
  BankAccountsResponse,
  BanksInfoResponse,
  ContactResponse,
  ContributionResponse,
  CreateReferenceRequest,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositParamRequest,
  DepositParamsResponse,
  DepositResponse,
  DocumentResponse,
  ExchangeRequest,
  ExchangeResponse,
  JsonData,
  KoyweWebhookRequest,
  MakeDepositRequest,
  PayfuraWebhookRequest,
  PaymentGatewayServiceController,
  PaymentGatewayServiceControllerMethods,
  PaymentMethodsResponse,
  PG_Token,
  SearchTransactionRequest,
  SocureDocumentRequest,
  TransactionResponse,
  TransferFundsRequest,
  TransferFundsResponse,
  TransferMethodRequest,
  UploadDocumentRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { MainService } from '../services/main.service';
import { PaymentGatewayWebhooksService } from '../services/payment-gateway-webhooks.service';
import { PaymentGatewayService } from '../services/payment-gateway.service';

@RpcController()
@PaymentGatewayServiceControllerMethods()
export class PaymentGatewayController implements PaymentGatewayServiceController {
  constructor(
    private mainService: MainService,
    private paymentGatewayService: PaymentGatewayService,
    private webhooksService: PaymentGatewayWebhooksService,
  ) {}

  getAvailablePaymentMethods({ id }: UserIdRequest): Promise<PaymentMethodsResponse> {
    return this.mainService.getAvailablePaymentMethods(id);
  }

  getToken(): Promise<PG_Token> {
    return this.paymentGatewayService.getToken();
  }

  createAccount({ id }: UserIdRequest): Promise<AccountResponse> {
    return this.paymentGatewayService.createAccount(id);
  }

  createContact({ id }: UserIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.createContact(id);
  }

  uploadDocument(request: UploadDocumentRequest): Promise<DocumentResponse> {
    return this.paymentGatewayService.uploadDocument(request);
  }

  updateAccount(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateAccount(request);
  }

  updateContact(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateContact(request);
  }
  documentCheck(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.documentCheck(request);
  }

  cipCheck(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.cipCheck(request);
  }

  createReference(request: CreateReferenceRequest): Promise<JsonData> {
    return this.mainService.createReference(request);
  }

  updateBalance(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateBalance(request);
  }

  getBalance(request: BalanceRequest): Promise<BalanceResponse> {
    return this.paymentGatewayService.getBalance(request);
  }

  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    return this.mainService.makeWithdrawal(request);
  }

  updateWithdraw(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateWithdraw(request);
  }

  updateContribution(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateContribution(request);
  }

  verifyCreditCard(request: VerifyCreditCardRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.verifyCreditCard(request);
  }

  getCreditCards({ id }: UserIdRequest): Promise<CreditCardsResponse> {
    return this.paymentGatewayService.getCreditCards(id);
  }

  transferFunds(request: TransferFundsRequest): Promise<TransferFundsResponse> {
    return this.paymentGatewayService.transferFunds(request);
  }

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.mainService.addBankAccountParams(request);
  }

  getBankAccounts(request: UserIdRequest): Promise<BankAccountsResponse> {
    return this.paymentGatewayService.getBankAccounts(request);
  }

  getBanksInfo(request: UserIdRequest): Promise<BanksInfoResponse> {
    return this.mainService.getBanksInfo(request);
  }

  makeDeposit(request: MakeDepositRequest): Promise<ContributionResponse> {
    return this.paymentGatewayService.makeDeposit(request);
  }

  addDepositParams(request: DepositParamRequest): Promise<DepositResponse> {
    return this.paymentGatewayService.addDepositParams(request);
  }
  getTransactions(request: SearchTransactionRequest): Promise<TransactionResponse> {
    return this.paymentGatewayService.getTransactions(request);
  }
  getAccount({ id }: UserIdRequest): Promise<AccountResponse> {
    return this.paymentGatewayService.getAccount(id);
  }

  getContact({ id }: UserIdRequest): Promise<ContactResponse> {
    return this.paymentGatewayService.getContact(id);
  }
  createCreditCardResource({ id }: UserIdRequest): Promise<CreditCardResourceResponse> {
    return this.paymentGatewayService.createCreditCardResource(id);
  }

  getDepositParams(request: UserIdRequest): Promise<DepositParamsResponse> {
    return this.paymentGatewayService.getDepositParams(request);
  }

  koyweWebhooksHandler(request: KoyweWebhookRequest): Promise<SuccessResponse> {
    return this.webhooksService.koyweWebhooksHandler(request);
  }
  updateAssetDeposit(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateAssetDeposit(request);
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
  createSocureDocument(request: SocureDocumentRequest): Promise<SuccessResponse> {
    return this.webhooksService.createSocureDocument(request);
  }
  payfuraWebhooksHandler(request: PayfuraWebhookRequest): Promise<SuccessResponse> {
    return this.webhooksService.payfuraWebhooksHandler(request);
  }
}
