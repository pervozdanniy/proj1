/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, SuccessResponse } from "./common";

export const protobufPackage = "skopa.core";

export interface TransferFundsRequest {
  to: number;
  from: number;
  amount: string;
}

export interface TransferFundsResponse {
  data: TransferFunds | undefined;
}

export interface TransferFunds {
  uuid: string;
  amount: string;
  currency_type: string;
  status: string;
  created_at: string;
}

export interface CreditCardsResponse {
  data: CreditCard[];
}

export interface CreditCard {
  uuid: string;
  transfer_method_id: string;
  credit_card_bin: string;
  credit_card_type: string;
  credit_card_expiration_date: string;
  created_at: string;
  updated_at: string;
  status: string;
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
  bank_account_number: string;
  routing_number: string;
  funds_transfer_type: string;
  bank_account_name: string;
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
}

export interface PG_Token {
  data: Token_Data | undefined;
}

export interface Token_Data {
  token: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface PaymentGatewayServiceClient {
  list(request: PaymentGatewayListQuery, metadata?: Metadata): Observable<PaymentGatewayListResponse>;

  getToken(request: IdRequest, metadata?: Metadata): Observable<PG_Token>;

  createAccount(request: UserIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  updateAccount(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  createContact(request: UserIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  uploadDocument(request: UploadDocumentRequest, metadata?: Metadata): Observable<SuccessResponse>;

  documentCheck(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  cipCheck(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  createReference(request: UserIdRequest, metadata?: Metadata): Observable<PrimeTrustData>;

  getBalance(request: UserIdRequest, metadata?: Metadata): Observable<BalanceResponse>;

  getWithdrawalParams(request: UserIdRequest, metadata?: Metadata): Observable<WithdrawalsDataResponse>;

  updateBalance(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  updateContribution(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  addWithdrawalParams(request: WithdrawalParams, metadata?: Metadata): Observable<WithdrawalResponse>;

  makeWithdrawal(request: TransferMethodRequest, metadata?: Metadata): Observable<PrimeTrustData>;

  updateWithdraw(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  createCreditCardResource(request: UserIdRequest, metadata?: Metadata): Observable<CreditCardResourceResponse>;

  verifyCreditCard(request: VerifyCreditCardRequest, metadata?: Metadata): Observable<SuccessResponse>;

  getCreditCards(request: UserIdRequest, metadata?: Metadata): Observable<CreditCardsResponse>;

  transferFunds(request: TransferFundsRequest, metadata?: Metadata): Observable<TransferFundsResponse>;
}

export interface PaymentGatewayServiceController {
  list(
    request: PaymentGatewayListQuery,
    metadata?: Metadata,
  ): Promise<PaymentGatewayListResponse> | Observable<PaymentGatewayListResponse> | PaymentGatewayListResponse;

  getToken(request: IdRequest, metadata?: Metadata): Promise<PG_Token> | Observable<PG_Token> | PG_Token;

  createAccount(
    request: UserIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateAccount(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  createContact(
    request: UserIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  uploadDocument(
    request: UploadDocumentRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  documentCheck(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  cipCheck(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  createReference(
    request: UserIdRequest,
    metadata?: Metadata,
  ): Promise<PrimeTrustData> | Observable<PrimeTrustData> | PrimeTrustData;

  getBalance(
    request: UserIdRequest,
    metadata?: Metadata,
  ): Promise<BalanceResponse> | Observable<BalanceResponse> | BalanceResponse;

  getWithdrawalParams(
    request: UserIdRequest,
    metadata?: Metadata,
  ): Promise<WithdrawalsDataResponse> | Observable<WithdrawalsDataResponse> | WithdrawalsDataResponse;

  updateBalance(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateContribution(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  addWithdrawalParams(
    request: WithdrawalParams,
    metadata?: Metadata,
  ): Promise<WithdrawalResponse> | Observable<WithdrawalResponse> | WithdrawalResponse;

  makeWithdrawal(
    request: TransferMethodRequest,
    metadata?: Metadata,
  ): Promise<PrimeTrustData> | Observable<PrimeTrustData> | PrimeTrustData;

  updateWithdraw(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  createCreditCardResource(
    request: UserIdRequest,
    metadata?: Metadata,
  ): Promise<CreditCardResourceResponse> | Observable<CreditCardResourceResponse> | CreditCardResourceResponse;

  verifyCreditCard(
    request: VerifyCreditCardRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getCreditCards(
    request: UserIdRequest,
    metadata?: Metadata,
  ): Promise<CreditCardsResponse> | Observable<CreditCardsResponse> | CreditCardsResponse;

  transferFunds(
    request: TransferFundsRequest,
    metadata?: Metadata,
  ): Promise<TransferFundsResponse> | Observable<TransferFundsResponse> | TransferFundsResponse;
}

export function PaymentGatewayServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "list",
      "getToken",
      "createAccount",
      "updateAccount",
      "createContact",
      "uploadDocument",
      "documentCheck",
      "cipCheck",
      "createReference",
      "getBalance",
      "getWithdrawalParams",
      "updateBalance",
      "updateContribution",
      "addWithdrawalParams",
      "makeWithdrawal",
      "updateWithdraw",
      "createCreditCardResource",
      "verifyCreditCard",
      "getCreditCards",
      "transferFunds",
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
