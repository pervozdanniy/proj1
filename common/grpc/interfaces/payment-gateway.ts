/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, SuccessResponse, UserAgreement, UserDetails } from "./common";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "skopa.core";

export interface SocureDocumentRequest {
  user_id: number;
  uuid: string;
  label: string;
  status: string;
  document_number: string;
  expiration_date: string;
  issuing_date: string;
}

export interface LiquidoWebhookRequest {
  transactionId: string;
}

export interface PayfuraWebhookRequest {
  orderId: string;
}

export interface AccountStatusResponse {
  status: string;
}

export interface AgreementRequest {
  email: string;
  password?: string | undefined;
  phone?: string | undefined;
  country_code?: string | undefined;
  source?: string | undefined;
  status?: string | undefined;
  details?: UserDetails | undefined;
}

export interface KoyweWebhookRequest {
  eventName: string;
  orderId: string;
  timeStamp: string;
  signature: string;
}

export interface BanksInfoResponse {
  data: BankInfo[];
}

export interface BankInfo {
  bankCode: string;
  name: string;
  institutionName: string;
  transferCode: string;
}

export interface CreateReferenceRequest {
  id: number;
  amount: string;
  currency_type: string;
  type: string;
}

export interface SearchTransactionRequest {
  user_id: number;
  search_after: number;
  limit: number;
  search_term?: string | undefined;
}

export interface WalletResponse {
  wallet_address: string;
  asset_transfer_method_id: string;
}

export interface DepositParamsResponse {
  data: DepositParam[];
}

export interface DepositParam {
  id: number;
  transfer_method_id: string;
  bank_account_number: string;
  routing_number: string;
  funds_transfer_type: string;
  bank_account_name: string;
}

export interface DepositDataResponse {
  id: number;
  uuid: string;
  amount: string;
  currency_type: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  has_more: boolean;
  last_id?: number | undefined;
}

export interface Transaction {
  id: number;
  type: string;
  title: string;
  name: string;
  amount: string;
  fee: string;
  status: string;
  created_at: string;
}

export interface TransferResponse {
  to: string;
  from: string;
  amount: string;
  currency_type: string;
  status: string;
  created_at: string;
}

export interface ContactResponse {
  uuid: string;
  first_name: string;
  last_name: string;
  identity_confirmed: boolean;
  proof_of_address_documents_verified: boolean;
  identity_documents_verified: boolean;
  aml_cleared: boolean;
  cip_cleared: boolean;
}

export interface AssetWithdrawalRequest {
  id: number;
  amount: string;
  wallet: string;
}

export interface AccountResponse {
  uuid: string;
  name: string;
  number: string;
  status: string;
}

export interface PaymentMethodsResponse {
  methods: string[];
}

export interface DocumentResponse {
  document_id: string;
}

export interface DepositParamRequest {
  id: number;
  bank_account_id: number;
  funds_transfer_type: string;
}

export interface DepositResponse {
  transfer_method_id: string;
}

export interface MakeDepositRequest {
  id: number;
  funds_transfer_method_id: string;
  amount: string;
  cvv: string;
}

export interface ContributionResponse {
  contribution_id: string;
}

export interface BankAccountParams {
  id: number;
  bank_account_name: string;
  bank_account_number: string;
  routing_number?: string | undefined;
  bank_code?: string | undefined;
}

export interface BankAccountsResponse {
  data: BankAccountParams[];
}

export interface TransferFundsRequest {
  sender_id: number;
  receiver_id: number;
  amount: string;
  currency_type: string;
}

export interface TransferFundsResponse {
  data: TransferFunds | undefined;
}

export interface TransferFunds {
  amount: string;
  currency_type: string;
  status: string;
  created_at: string;
}

export interface CreditCardsResponse {
  data: CreditCard[];
}

export interface CreditCard {
  id: string;
  transfer_method_id: string;
  credit_card_bin: string;
  credit_card_type: string;
  credit_card_expiration_date: string;
  created_at: string;
  updated_at: string;
  status: string;
  uuid: string;
}

export interface VerifyCreditCardRequest {
  contact_id: string;
  transfer_method_id: string;
  resource_id: string;
}

export interface CreditCardResourceResponse {
  redirect_url: string;
}

export interface Withdrawal {
  id: number;
  transfer_method_id: string;
  bank_account_number: string;
  routing_number: string;
  funds_transfer_type: string;
  bank_account_name: string;
}

export interface PaymentGateway {
  id: number;
  alias: string;
  name: string;
}

export interface TransferMethodRequest {
  id: number;
  bank_account_id: number;
  funds_transfer_type: string;
  amount: string;
}

export interface WithdrawalResponse {
  transfer_method_id: string;
}

export interface WithdrawalParams {
  id: number;
  bank_account_id: number;
  funds_transfer_type: string;
}

export interface BalanceRequest {
  user_id: number;
  currencies: string[];
}

export interface ExchangeRequest {
  amount: string;
  currency_type: string;
  currencies: string[];
}

export interface Conversion {
  currency: string;
  amount: string;
  rate?: string | undefined;
}

export interface BalanceResponse {
  settled: string;
  currency_type: string;
  conversions: Conversion[];
}

export interface ExchangeResponse {
  amount: string;
  currency_type: string;
  conversions: Conversion[];
}

export interface JsonData {
  data: string;
}

export interface AccountIdRequest {
  id: string;
  resource_id?: string | undefined;
}

export interface FileData {
  buffer: Uint8Array;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

export interface UploadDocumentRequest {
  label: string;
  file: FileData | undefined;
  userId: UserIdRequest | undefined;
}

export interface UserIdRequest {
  id: number;
  resource_id?: number | undefined;
}

export interface PG_Token {
  data: Token_Data | undefined;
}

export interface Token_Data {
  token: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface PaymentGatewayServiceClient {
  createAgreement(request: AgreementRequest, ...rest: any): Observable<UserAgreement>;

  getToken(request: Empty, ...rest: any): Observable<PG_Token>;

  getAvailablePaymentMethods(request: UserIdRequest, ...rest: any): Observable<PaymentMethodsResponse>;

  createAccount(request: UserIdRequest, ...rest: any): Observable<AccountResponse>;

  getAccount(request: UserIdRequest, ...rest: any): Observable<AccountResponse>;

  getContact(request: UserIdRequest, ...rest: any): Observable<ContactResponse>;

  createContact(request: UserIdRequest, ...rest: any): Observable<SuccessResponse>;

  uploadDocument(request: UploadDocumentRequest, ...rest: any): Observable<DocumentResponse>;

  getBalance(request: BalanceRequest, ...rest: any): Observable<BalanceResponse>;

  exchange(request: ExchangeRequest, ...rest: any): Observable<ExchangeResponse>;

  getUserAccountStatus(request: IdRequest, ...rest: any): Observable<AccountStatusResponse>;

  createSocureDocument(request: SocureDocumentRequest, ...rest: any): Observable<SuccessResponse>;

  failedSocureDocument(request: UserIdRequest, ...rest: any): Observable<SuccessResponse>;

  transferToHotWallet(request: Empty, ...rest: any): Observable<SuccessResponse>;

  getTransactions(request: SearchTransactionRequest, ...rest: any): Observable<TransactionResponse>;

  /** banks */

  getBankAccounts(request: UserIdRequest, ...rest: any): Observable<BankAccountsResponse>;

  getBanksInfo(request: UserIdRequest, ...rest: any): Observable<BanksInfoResponse>;

  addBankAccountParams(request: BankAccountParams, ...rest: any): Observable<BankAccountParams>;

  /** deposit funds */

  createReference(request: CreateReferenceRequest, ...rest: any): Observable<JsonData>;

  addDepositParams(request: DepositParamRequest, ...rest: any): Observable<DepositResponse>;

  getDepositParams(request: UserIdRequest, ...rest: any): Observable<DepositParamsResponse>;

  createCreditCardResource(request: UserIdRequest, ...rest: any): Observable<CreditCardResourceResponse>;

  verifyCreditCard(request: VerifyCreditCardRequest, ...rest: any): Observable<SuccessResponse>;

  makeDeposit(request: MakeDepositRequest, ...rest: any): Observable<ContributionResponse>;

  getCreditCards(request: UserIdRequest, ...rest: any): Observable<CreditCardsResponse>;

  /** transfer funds */

  transferFunds(request: TransferFundsRequest, ...rest: any): Observable<TransferFundsResponse>;

  /** withdrawal */

  makeWithdrawal(request: TransferMethodRequest, ...rest: any): Observable<JsonData>;

  /** webhooks */

  documentCheck(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  cipCheck(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  updateAccount(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  updateContact(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  updateBalance(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  updateContribution(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  updateWithdraw(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  updateAssetDeposit(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  koyweWebhooksHandler(request: KoyweWebhookRequest, ...rest: any): Observable<SuccessResponse>;

  payfuraWebhooksHandler(request: PayfuraWebhookRequest, ...rest: any): Observable<SuccessResponse>;

  liquidoWebhooksHandler(request: LiquidoWebhookRequest, ...rest: any): Observable<SuccessResponse>;
}

export interface PaymentGatewayServiceController {
  createAgreement(
    request: AgreementRequest,
    ...rest: any
  ): Promise<UserAgreement> | Observable<UserAgreement> | UserAgreement;

  getToken(request: Empty, ...rest: any): Promise<PG_Token> | Observable<PG_Token> | PG_Token;

  getAvailablePaymentMethods(
    request: UserIdRequest,
    ...rest: any
  ): Promise<PaymentMethodsResponse> | Observable<PaymentMethodsResponse> | PaymentMethodsResponse;

  createAccount(
    request: UserIdRequest,
    ...rest: any
  ): Promise<AccountResponse> | Observable<AccountResponse> | AccountResponse;

  getAccount(
    request: UserIdRequest,
    ...rest: any
  ): Promise<AccountResponse> | Observable<AccountResponse> | AccountResponse;

  getContact(
    request: UserIdRequest,
    ...rest: any
  ): Promise<ContactResponse> | Observable<ContactResponse> | ContactResponse;

  createContact(
    request: UserIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  uploadDocument(
    request: UploadDocumentRequest,
    ...rest: any
  ): Promise<DocumentResponse> | Observable<DocumentResponse> | DocumentResponse;

  getBalance(
    request: BalanceRequest,
    ...rest: any
  ): Promise<BalanceResponse> | Observable<BalanceResponse> | BalanceResponse;

  exchange(
    request: ExchangeRequest,
    ...rest: any
  ): Promise<ExchangeResponse> | Observable<ExchangeResponse> | ExchangeResponse;

  getUserAccountStatus(
    request: IdRequest,
    ...rest: any
  ): Promise<AccountStatusResponse> | Observable<AccountStatusResponse> | AccountStatusResponse;

  createSocureDocument(
    request: SocureDocumentRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  failedSocureDocument(
    request: UserIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  transferToHotWallet(
    request: Empty,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getTransactions(
    request: SearchTransactionRequest,
    ...rest: any
  ): Promise<TransactionResponse> | Observable<TransactionResponse> | TransactionResponse;

  /** banks */

  getBankAccounts(
    request: UserIdRequest,
    ...rest: any
  ): Promise<BankAccountsResponse> | Observable<BankAccountsResponse> | BankAccountsResponse;

  getBanksInfo(
    request: UserIdRequest,
    ...rest: any
  ): Promise<BanksInfoResponse> | Observable<BanksInfoResponse> | BanksInfoResponse;

  addBankAccountParams(
    request: BankAccountParams,
    ...rest: any
  ): Promise<BankAccountParams> | Observable<BankAccountParams> | BankAccountParams;

  /** deposit funds */

  createReference(request: CreateReferenceRequest, ...rest: any): Promise<JsonData> | Observable<JsonData> | JsonData;

  addDepositParams(
    request: DepositParamRequest,
    ...rest: any
  ): Promise<DepositResponse> | Observable<DepositResponse> | DepositResponse;

  getDepositParams(
    request: UserIdRequest,
    ...rest: any
  ): Promise<DepositParamsResponse> | Observable<DepositParamsResponse> | DepositParamsResponse;

  createCreditCardResource(
    request: UserIdRequest,
    ...rest: any
  ): Promise<CreditCardResourceResponse> | Observable<CreditCardResourceResponse> | CreditCardResourceResponse;

  verifyCreditCard(
    request: VerifyCreditCardRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  makeDeposit(
    request: MakeDepositRequest,
    ...rest: any
  ): Promise<ContributionResponse> | Observable<ContributionResponse> | ContributionResponse;

  getCreditCards(
    request: UserIdRequest,
    ...rest: any
  ): Promise<CreditCardsResponse> | Observable<CreditCardsResponse> | CreditCardsResponse;

  /** transfer funds */

  transferFunds(
    request: TransferFundsRequest,
    ...rest: any
  ): Promise<TransferFundsResponse> | Observable<TransferFundsResponse> | TransferFundsResponse;

  /** withdrawal */

  makeWithdrawal(request: TransferMethodRequest, ...rest: any): Promise<JsonData> | Observable<JsonData> | JsonData;

  /** webhooks */

  documentCheck(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  cipCheck(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateAccount(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateContact(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateBalance(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateContribution(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateWithdraw(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateAssetDeposit(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  koyweWebhooksHandler(
    request: KoyweWebhookRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  payfuraWebhooksHandler(
    request: PayfuraWebhookRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  liquidoWebhooksHandler(
    request: LiquidoWebhookRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;
}

export function PaymentGatewayServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createAgreement",
      "getToken",
      "getAvailablePaymentMethods",
      "createAccount",
      "getAccount",
      "getContact",
      "createContact",
      "uploadDocument",
      "getBalance",
      "exchange",
      "getUserAccountStatus",
      "createSocureDocument",
      "failedSocureDocument",
      "transferToHotWallet",
      "getTransactions",
      "getBankAccounts",
      "getBanksInfo",
      "addBankAccountParams",
      "createReference",
      "addDepositParams",
      "getDepositParams",
      "createCreditCardResource",
      "verifyCreditCard",
      "makeDeposit",
      "getCreditCards",
      "transferFunds",
      "makeWithdrawal",
      "documentCheck",
      "cipCheck",
      "updateAccount",
      "updateContact",
      "updateBalance",
      "updateContribution",
      "updateWithdraw",
      "updateAssetDeposit",
      "koyweWebhooksHandler",
      "payfuraWebhooksHandler",
      "liquidoWebhooksHandler",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("PaymentGatewayService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("PaymentGatewayService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PAYMENT_GATEWAY_SERVICE_NAME = "PaymentGatewayService";
