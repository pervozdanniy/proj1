/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, SuccessResponse, UserAgreement, UserDetails } from "./common";
import { Empty } from "./google/protobuf/empty";
import { VeriffHookRequest, VeriffSessionResponse, WebhookResponse } from "./veriff";

export const protobufPackage = "skopa.core";

export interface PrimeWebhookRequest {
  id: string;
  account_id: string;
  action: string;
  data: ChangesData | undefined;
  resource_id: string;
  resource_type: string;
}

export interface ChangesData {
  changes: string[];
}

export interface LinkSessionResponse {
  sessionKey: string;
}

export interface LinkCustomerRequest {
  customerId: string;
  sessionId: string;
}

export interface DepositFlowRequest {
  user_id: number;
  amount: string;
  currency: string;
  type: string;
}

export interface LinkTransferData {
  paymentId: string;
  paymentStatus: string;
}

export interface DepositFlowResponse {
  action: string;
  flow_id?: number | undefined;
  banks?: DepositSelectBankData | undefined;
  cards?: DepositSelectCardData | undefined;
  redirect?: DepositRedirectData | undefined;
  link_transfer?: LinkTransferData | undefined;
}

export interface DepositSelectBankData {
  list: BankAccountParams[];
}

export interface DepositSelectCardData {
  list: CreditCard[];
}

export interface DepositRedirectData {
  url: string;
  info: TransferInfo | undefined;
}

export interface TransferInfo {
  amount: string;
  currency: string;
  fee: string;
  rate?: string | undefined;
}

export interface DepositNextStepRequest {
  id: number;
  user_id: number;
  bank?: SelectBankRequest | undefined;
  card?: SelectCardRequest | undefined;
}

export interface SelectBankRequest {
  id: number;
  transfer_type: string;
}

export interface SelectCardRequest {
  id: number;
  cvv: string;
}

export interface LiquidoWebhookRequest {
  transactionId: string;
}

export interface FacilitaWebhookRequest {
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

export interface DepositParamRequest {
  id: number;
  bank_account_id: number;
  funds_transfer_type: string;
}

export interface DepositResponse {
  transfer_method_id: string;
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
  id: number;
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
  currency_type: string;
  conversions: Rates[];
}

export interface Rates {
  currency: string;
  rate?: string | undefined;
}

export interface JsonData {
  data: string;
}

export interface AccountIdRequest {
  id: string;
  resource_id?: string | undefined;
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

  /** link */

  linkSession(request: UserIdRequest, ...rest: any): Observable<LinkSessionResponse>;

  saveCustomer(request: LinkCustomerRequest, ...rest: any): Observable<SuccessResponse>;

  /** veriff */

  generateVeriffLink(request: UserIdRequest, ...rest: any): Observable<VeriffSessionResponse>;

  veriffHookHandler(request: VeriffHookRequest, ...rest: any): Observable<SuccessResponse>;

  veriffWebhookHandler(request: WebhookResponse, ...rest: any): Observable<SuccessResponse>;

  getAvailablePaymentMethods(request: UserIdRequest, ...rest: any): Observable<PaymentMethodsResponse>;

  getContact(request: UserIdRequest, ...rest: any): Observable<ContactResponse>;

  getBalance(request: BalanceRequest, ...rest: any): Observable<BalanceResponse>;

  exchange(request: ExchangeRequest, ...rest: any): Observable<ExchangeResponse>;

  getUserAccountStatus(request: IdRequest, ...rest: any): Observable<AccountStatusResponse>;

  transferToHotWallet(request: Empty, ...rest: any): Observable<SuccessResponse>;

  getTransactions(request: SearchTransactionRequest, ...rest: any): Observable<TransactionResponse>;

  /** banks */

  getBanksInfo(request: UserIdRequest, ...rest: any): Observable<BanksInfoResponse>;

  addBankAccountParams(request: BankAccountParams, ...rest: any): Observable<BankAccountParams>;

  /** deposit funds */

  createCreditCardResource(request: UserIdRequest, ...rest: any): Observable<CreditCardResourceResponse>;

  verifyCreditCard(request: VerifyCreditCardRequest, ...rest: any): Observable<SuccessResponse>;

  /** transfer funds */

  transferFunds(request: TransferFundsRequest, ...rest: any): Observable<TransferFundsResponse>;

  /** withdrawal */

  makeWithdrawal(request: TransferMethodRequest, ...rest: any): Observable<TransferInfo>;

  /** webhooks */

  primeWebhooksHandler(request: PrimeWebhookRequest, ...rest: any): Observable<SuccessResponse>;

  koyweWebhooksHandler(request: KoyweWebhookRequest, ...rest: any): Observable<SuccessResponse>;

  facilitaWebhooksHandler(request: FacilitaWebhookRequest, ...rest: any): Observable<SuccessResponse>;

  liquidoWebhooksHandler(request: LiquidoWebhookRequest, ...rest: any): Observable<SuccessResponse>;
}

export interface PaymentGatewayServiceController {
  createAgreement(
    request: AgreementRequest,
    ...rest: any
  ): Promise<UserAgreement> | Observable<UserAgreement> | UserAgreement;

  /** link */

  linkSession(
    request: UserIdRequest,
    ...rest: any
  ): Promise<LinkSessionResponse> | Observable<LinkSessionResponse> | LinkSessionResponse;

  saveCustomer(
    request: LinkCustomerRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  /** veriff */

  generateVeriffLink(
    request: UserIdRequest,
    ...rest: any
  ): Promise<VeriffSessionResponse> | Observable<VeriffSessionResponse> | VeriffSessionResponse;

  veriffHookHandler(
    request: VeriffHookRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  veriffWebhookHandler(
    request: WebhookResponse,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getAvailablePaymentMethods(
    request: UserIdRequest,
    ...rest: any
  ): Promise<PaymentMethodsResponse> | Observable<PaymentMethodsResponse> | PaymentMethodsResponse;

  getContact(
    request: UserIdRequest,
    ...rest: any
  ): Promise<ContactResponse> | Observable<ContactResponse> | ContactResponse;

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

  transferToHotWallet(
    request: Empty,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getTransactions(
    request: SearchTransactionRequest,
    ...rest: any
  ): Promise<TransactionResponse> | Observable<TransactionResponse> | TransactionResponse;

  /** banks */

  getBanksInfo(
    request: UserIdRequest,
    ...rest: any
  ): Promise<BanksInfoResponse> | Observable<BanksInfoResponse> | BanksInfoResponse;

  addBankAccountParams(
    request: BankAccountParams,
    ...rest: any
  ): Promise<BankAccountParams> | Observable<BankAccountParams> | BankAccountParams;

  /** deposit funds */

  createCreditCardResource(
    request: UserIdRequest,
    ...rest: any
  ): Promise<CreditCardResourceResponse> | Observable<CreditCardResourceResponse> | CreditCardResourceResponse;

  verifyCreditCard(
    request: VerifyCreditCardRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  /** transfer funds */

  transferFunds(
    request: TransferFundsRequest,
    ...rest: any
  ): Promise<TransferFundsResponse> | Observable<TransferFundsResponse> | TransferFundsResponse;

  /** withdrawal */

  makeWithdrawal(
    request: TransferMethodRequest,
    ...rest: any
  ): Promise<TransferInfo> | Observable<TransferInfo> | TransferInfo;

  /** webhooks */

  primeWebhooksHandler(
    request: PrimeWebhookRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  koyweWebhooksHandler(
    request: KoyweWebhookRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  facilitaWebhooksHandler(
    request: FacilitaWebhookRequest,
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
      "linkSession",
      "saveCustomer",
      "generateVeriffLink",
      "veriffHookHandler",
      "veriffWebhookHandler",
      "getAvailablePaymentMethods",
      "getContact",
      "getBalance",
      "exchange",
      "getUserAccountStatus",
      "transferToHotWallet",
      "getTransactions",
      "getBanksInfo",
      "addBankAccountParams",
      "createCreditCardResource",
      "verifyCreditCard",
      "transferFunds",
      "makeWithdrawal",
      "primeWebhooksHandler",
      "koyweWebhooksHandler",
      "facilitaWebhooksHandler",
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

export interface DepositFlowServiceClient {
  start(request: DepositFlowRequest, ...rest: any): Observable<DepositFlowResponse>;

  payWithSelectedResource(request: DepositNextStepRequest, ...rest: any): Observable<TransferInfo>;
}

export interface DepositFlowServiceController {
  start(
    request: DepositFlowRequest,
    ...rest: any
  ): Promise<DepositFlowResponse> | Observable<DepositFlowResponse> | DepositFlowResponse;

  payWithSelectedResource(
    request: DepositNextStepRequest,
    ...rest: any
  ): Promise<TransferInfo> | Observable<TransferInfo> | TransferInfo;
}

export function DepositFlowServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["start", "payWithSelectedResource"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("DepositFlowService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("DepositFlowService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const DEPOSIT_FLOW_SERVICE_NAME = "DepositFlowService";
