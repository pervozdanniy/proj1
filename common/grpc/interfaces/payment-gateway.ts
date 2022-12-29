/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, SuccessResponse } from "./common";

export const protobufPackage = "skopa.core";

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
  token: string;
  funds_transfer_method_id: string;
  amount: string;
}

export interface WithdrawalParamsResponse {
  transfer_method_id: string;
}

export interface WithdrawalParams {
  id: number;
  token: string;
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
}

export interface UpdateAccountRequest {
  id: string;
  status: string;
  payment_gateway: string;
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
  tokenData: TokenSendRequest | undefined;
}

export interface TokenSendRequest {
  id: number;
  token: string;
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

  createUser(request: IdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  getToken(request: IdRequest, metadata?: Metadata): Observable<PG_Token>;

  createAccount(request: TokenSendRequest, metadata?: Metadata): Observable<SuccessResponse>;

  updateAccount(request: UpdateAccountRequest, metadata?: Metadata): Observable<SuccessResponse>;

  createContact(request: TokenSendRequest, metadata?: Metadata): Observable<SuccessResponse>;

  uploadDocument(request: UploadDocumentRequest, metadata?: Metadata): Observable<SuccessResponse>;

  documentCheck(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  createReference(request: TokenSendRequest, metadata?: Metadata): Observable<PrimeTrustData>;

  getBalance(request: TokenSendRequest, metadata?: Metadata): Observable<BalanceResponse>;

  updateBalance(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  addWithdrawalParams(request: WithdrawalParams, metadata?: Metadata): Observable<WithdrawalParamsResponse>;

  makeWithdrawal(request: TransferMethodRequest, metadata?: Metadata): Observable<PrimeTrustData>;

  updateWithdraw(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;
}

export interface PaymentGatewayServiceController {
  list(
    request: PaymentGatewayListQuery,
    metadata?: Metadata,
  ): Promise<PaymentGatewayListResponse> | Observable<PaymentGatewayListResponse> | PaymentGatewayListResponse;

  createUser(
    request: IdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getToken(request: IdRequest, metadata?: Metadata): Promise<PG_Token> | Observable<PG_Token> | PG_Token;

  createAccount(
    request: TokenSendRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  updateAccount(
    request: UpdateAccountRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  createContact(
    request: TokenSendRequest,
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

  createReference(
    request: TokenSendRequest,
    metadata?: Metadata,
  ): Promise<PrimeTrustData> | Observable<PrimeTrustData> | PrimeTrustData;

  getBalance(
    request: TokenSendRequest,
    metadata?: Metadata,
  ): Promise<BalanceResponse> | Observable<BalanceResponse> | BalanceResponse;

  updateBalance(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  addWithdrawalParams(
    request: WithdrawalParams,
    metadata?: Metadata,
  ): Promise<WithdrawalParamsResponse> | Observable<WithdrawalParamsResponse> | WithdrawalParamsResponse;

  makeWithdrawal(
    request: TransferMethodRequest,
    metadata?: Metadata,
  ): Promise<PrimeTrustData> | Observable<PrimeTrustData> | PrimeTrustData;

  updateWithdraw(
    request: AccountIdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;
}

export function PaymentGatewayServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "list",
      "createUser",
      "getToken",
      "createAccount",
      "updateAccount",
      "createContact",
      "uploadDocument",
      "documentCheck",
      "createReference",
      "getBalance",
      "updateBalance",
      "addWithdrawalParams",
      "makeWithdrawal",
      "updateWithdraw",
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
