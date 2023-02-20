/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, SuccessResponse } from "./common";

export const protobufPackage = "skopa.core";

export interface SearchTransactionRequest {
  user_id: number;
  page: number;
  limit: number;
  searchTerm?: string | undefined;
}

export interface CreateWalledRequest {
  id: number;
  label: string;
}

export interface WalletResponse {
  id?: number | undefined;
  label: string;
  wallet_address: string;
  wallet_for: string;
  asset_transfer_method_id: string;
  created_at: string;
}

export interface WithdrawalDataResponse {
  id: number;
  params_id: number;
  uuid: string;
  amount: string;
  currency_type: string;
  status: string;
  created_at: string;
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
  contributor_email: string;
  contributor_name: string;
  funds_transfer_type: string;
  deposit_param_id?: number | undefined;
  card_resource_id?: number | undefined;
}

export interface TransactionResponse {
  transactions: Transaction[];
  totalTransactions: number;
  totalPages: number;
  currentPage: number;
}

export interface Transaction {
  id: number;
  title: string;
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

export interface AccountResponse {
  uuid: string;
  name: string;
  number: string;
  status: string;
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

export interface MakeContributionRequest {
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
  routing_number: string;
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
  id: number;
  resource_id: string;
}

export interface CreditCardResourceResponse {
  resource_id: string;
  resource_token: string;
}

export interface WithdrawalsDataResponse {
  data: Withdrawal[];
}

export interface Withdrawal {
  id: number;
  transfer_method_id: string;
  bank_account_number: string;
  routing_number: string;
  funds_transfer_type: string;
  bank_account_name: string;
}

export interface PaymentGatewayRequest {
  name: string;
}

export interface PaymentGatewayListQuery {
  limit: number;
  offset: number;
}

export interface PaymentGatewayListResponse {
  items: PaymentGateway[];
  count: number;
}

export interface PaymentGateway {
  id: number;
  alias: string;
  name: string;
}

export interface TransferMethodRequest {
  id: number;
  funds_transfer_method_id: string;
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

export interface BalanceResponse {
  settled: string;
  currency_type: string;
}

export interface PrimeTrustData {
  data: string;
}

export interface AccountIdRequest {
  id: string;
  payment_gateway: string;
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
  list(request: PaymentGatewayListQuery, ...rest: any): Observable<PaymentGatewayListResponse>;

  getToken(request: IdRequest, ...rest: any): Observable<PG_Token>;

  createAccount(request: UserIdRequest, ...rest: any): Observable<AccountResponse>;

  getAccount(request: UserIdRequest, ...rest: any): Observable<AccountResponse>;

  getContact(request: UserIdRequest, ...rest: any): Observable<ContactResponse>;

  updateAccount(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  createContact(request: UserIdRequest, ...rest: any): Observable<SuccessResponse>;

  uploadDocument(request: UploadDocumentRequest, ...rest: any): Observable<DocumentResponse>;

  documentCheck(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  cipCheck(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  getBalance(request: UserIdRequest, ...rest: any): Observable<BalanceResponse>;

  updateBalance(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  getBankAccounts(request: UserIdRequest, ...rest: any): Observable<BankAccountsResponse>;

  addBankAccountParams(request: BankAccountParams, ...rest: any): Observable<BankAccountParams>;

  getTransactions(request: SearchTransactionRequest, ...rest: any): Observable<TransactionResponse>;

  /** deposit funds */

  createReference(request: UserIdRequest, ...rest: any): Observable<PrimeTrustData>;

  addDepositParams(request: DepositParamRequest, ...rest: any): Observable<DepositResponse>;

  getDepositById(request: UserIdRequest, ...rest: any): Observable<DepositDataResponse>;

  getDepositParams(request: UserIdRequest, ...rest: any): Observable<DepositParamsResponse>;

  createCreditCardResource(request: UserIdRequest, ...rest: any): Observable<CreditCardResourceResponse>;

  verifyCreditCard(request: VerifyCreditCardRequest, ...rest: any): Observable<SuccessResponse>;

  updateContribution(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  makeContribution(request: MakeContributionRequest, ...rest: any): Observable<ContributionResponse>;

  getCreditCards(request: UserIdRequest, ...rest: any): Observable<CreditCardsResponse>;

  /** transfer funds */

  transferFunds(request: TransferFundsRequest, ...rest: any): Observable<TransferFundsResponse>;

  /** withdrawal */

  getWithdrawalById(request: UserIdRequest, ...rest: any): Observable<WithdrawalDataResponse>;

  getWithdrawalParams(request: UserIdRequest, ...rest: any): Observable<WithdrawalsDataResponse>;

  addWithdrawalParams(request: WithdrawalParams, ...rest: any): Observable<WithdrawalResponse>;

  makeWithdrawal(request: TransferMethodRequest, ...rest: any): Observable<PrimeTrustData>;

  updateWithdraw(request: AccountIdRequest, ...rest: any): Observable<SuccessResponse>;

  createWallet(request: CreateWalledRequest, ...rest: any): Observable<WalletResponse>;
}

export interface PaymentGatewayServiceController {
  list(
    request: PaymentGatewayListQuery,
    ...rest: any
  ): Promise<PaymentGatewayListResponse> | Observable<PaymentGatewayListResponse> | PaymentGatewayListResponse;

  getToken(request: IdRequest, ...rest: any): Promise<PG_Token> | Observable<PG_Token> | PG_Token;

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

  updateAccount(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  createContact(
    request: UserIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  uploadDocument(
    request: UploadDocumentRequest,
    ...rest: any
  ): Promise<DocumentResponse> | Observable<DocumentResponse> | DocumentResponse;

  documentCheck(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  cipCheck(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getBalance(
    request: UserIdRequest,
    ...rest: any
  ): Promise<BalanceResponse> | Observable<BalanceResponse> | BalanceResponse;

  updateBalance(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getBankAccounts(
    request: UserIdRequest,
    ...rest: any
  ): Promise<BankAccountsResponse> | Observable<BankAccountsResponse> | BankAccountsResponse;

  addBankAccountParams(
    request: BankAccountParams,
    ...rest: any
  ): Promise<BankAccountParams> | Observable<BankAccountParams> | BankAccountParams;

  getTransactions(
    request: SearchTransactionRequest,
    ...rest: any
  ): Promise<TransactionResponse> | Observable<TransactionResponse> | TransactionResponse;

  /** deposit funds */

  createReference(
    request: UserIdRequest,
    ...rest: any
  ): Promise<PrimeTrustData> | Observable<PrimeTrustData> | PrimeTrustData;

  addDepositParams(
    request: DepositParamRequest,
    ...rest: any
  ): Promise<DepositResponse> | Observable<DepositResponse> | DepositResponse;

  getDepositById(
    request: UserIdRequest,
    ...rest: any
  ): Promise<DepositDataResponse> | Observable<DepositDataResponse> | DepositDataResponse;

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

  updateContribution(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  makeContribution(
    request: MakeContributionRequest,
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

  getWithdrawalById(
    request: UserIdRequest,
    ...rest: any
  ): Promise<WithdrawalDataResponse> | Observable<WithdrawalDataResponse> | WithdrawalDataResponse;

  getWithdrawalParams(
    request: UserIdRequest,
    ...rest: any
  ): Promise<WithdrawalsDataResponse> | Observable<WithdrawalsDataResponse> | WithdrawalsDataResponse;

  addWithdrawalParams(
    request: WithdrawalParams,
    ...rest: any
  ): Promise<WithdrawalResponse> | Observable<WithdrawalResponse> | WithdrawalResponse;

  makeWithdrawal(
    request: TransferMethodRequest,
    ...rest: any
  ): Promise<PrimeTrustData> | Observable<PrimeTrustData> | PrimeTrustData;

  updateWithdraw(
    request: AccountIdRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  createWallet(
    request: CreateWalledRequest,
    ...rest: any
  ): Promise<WalletResponse> | Observable<WalletResponse> | WalletResponse;
}

export function PaymentGatewayServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "list",
      "getToken",
      "createAccount",
      "getAccount",
      "getContact",
      "updateAccount",
      "createContact",
      "uploadDocument",
      "documentCheck",
      "cipCheck",
      "getBalance",
      "updateBalance",
      "getBankAccounts",
      "addBankAccountParams",
      "getTransactions",
      "createReference",
      "addDepositParams",
      "getDepositById",
      "getDepositParams",
      "createCreditCardResource",
      "verifyCreditCard",
      "updateContribution",
      "makeContribution",
      "getCreditCards",
      "transferFunds",
      "getWithdrawalById",
      "getWithdrawalParams",
      "addWithdrawalParams",
      "makeWithdrawal",
      "updateWithdraw",
      "createWallet",
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
