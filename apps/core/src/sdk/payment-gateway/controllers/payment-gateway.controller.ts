import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  AccountResponse,
  BalanceResponse,
  BankAccountParams,
  BankAccountsResponse,
  ContactResponse,
  ContributionResponse,
  CreateReferenceRequest,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositDataResponse,
  DepositParamRequest,
  DepositParamsResponse,
  DepositResponse,
  DocumentResponse,
  JsonData,
  MakeContributionRequest,
  PaymentGatewayServiceController,
  PaymentGatewayServiceControllerMethods,
  PG_Token,
  SearchTransactionRequest,
  TransactionResponse,
  TransferFundsRequest,
  TransferFundsResponse,
  TransferMethodRequest,
  UploadDocumentRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
  WithdrawalDataResponse,
  WithdrawalParams,
  WithdrawalResponse,
  WithdrawalsDataResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { PaymentGatewayWebhooksService } from '../services/payment-gateway-webhooks.service';
import { PaymentGatewayService } from '../services/payment-gateway.service';

@RpcController()
@PaymentGatewayServiceControllerMethods()
export class PaymentGatewayController implements PaymentGatewayServiceController {
  constructor(
    private paymentGatewayService: PaymentGatewayService,
    private webhooksService: PaymentGatewayWebhooksService,
  ) {}

  getToken(): Promise<PG_Token> {
    return this.paymentGatewayService.getToken();
  }

  createAccount(request: UserIdRequest): Promise<AccountResponse> {
    return this.paymentGatewayService.createAccount(request);
  }

  createContact(request: UserIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.createContact(request);
  }

  uploadDocument(request: UploadDocumentRequest): Promise<DocumentResponse> {
    return this.paymentGatewayService.uploadDocument(request);
  }

  updateAccount(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateAccount(request);
  }
  documentCheck(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.documentCheck(request);
  }

  cipCheck(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.cipCheck(request);
  }

  createReference(request: CreateReferenceRequest): Promise<JsonData> {
    return this.paymentGatewayService.createReference(request);
  }

  updateBalance(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateBalance(request);
  }

  getBalance(request: UserIdRequest): Promise<BalanceResponse> {
    return this.paymentGatewayService.getBalance(request);
  }

  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    return this.paymentGatewayService.makeWithdrawal(request);
  }

  updateWithdraw(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateWithdraw(request);
  }

  updateContribution(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.webhooksService.updateContribution(request);
  }

  addWithdrawalParams(request: WithdrawalParams): Promise<WithdrawalResponse> {
    return this.paymentGatewayService.addWithdrawalParams(request);
  }

  getWithdrawalParams(request: UserIdRequest): Promise<WithdrawalsDataResponse> {
    return this.paymentGatewayService.getWithdrawalParams(request);
  }

  verifyCreditCard(request: VerifyCreditCardRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.verifyCreditCard(request);
  }

  getCreditCards(request: UserIdRequest): Promise<CreditCardsResponse> {
    return this.paymentGatewayService.getCreditCards(request);
  }

  transferFunds(request: TransferFundsRequest): Promise<TransferFundsResponse> {
    return this.paymentGatewayService.transferFunds(request);
  }

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.paymentGatewayService.addBankAccountParams(request);
  }

  getBankAccounts(request: UserIdRequest): Promise<BankAccountsResponse> {
    return this.paymentGatewayService.getBankAccounts(request);
  }

  makeContribution(request: MakeContributionRequest): Promise<ContributionResponse> {
    return this.paymentGatewayService.makeContribution(request);
  }

  addDepositParams(request: DepositParamRequest): Promise<DepositResponse> {
    return this.paymentGatewayService.addDepositParams(request);
  }

  getDepositById(request: UserIdRequest): Promise<DepositDataResponse> {
    return this.paymentGatewayService.getDepositById(request);
  }
  getWithdrawalById(request: UserIdRequest): Promise<WithdrawalDataResponse> {
    return this.paymentGatewayService.getWithdrawalById(request);
  }
  getTransactions(request: SearchTransactionRequest): Promise<TransactionResponse> {
    return this.paymentGatewayService.getTransactions(request);
  }
  getAccount(request: UserIdRequest): Promise<AccountResponse> {
    return this.paymentGatewayService.getAccount(request);
  }

  getContact(request: UserIdRequest): Promise<ContactResponse> {
    return this.paymentGatewayService.getContact(request);
  }
  createCreditCardResource(request: UserIdRequest): Promise<CreditCardResourceResponse> {
    return this.paymentGatewayService.createCreditCardResource(request);
  }

  getDepositParams(request: UserIdRequest): Promise<DepositParamsResponse> {
    return this.paymentGatewayService.getDepositParams(request);
  }
}
