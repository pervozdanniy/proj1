/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest } from "./common";

export const protobufPackage = "skopa.core";

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

export interface SuccessResponse {
  success: boolean;
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
  createUser(request: IdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  getToken(request: IdRequest, metadata?: Metadata): Observable<PG_Token>;

  createAccount(request: TokenSendRequest, metadata?: Metadata): Observable<SuccessResponse>;

  updateAccount(request: UpdateAccountRequest, metadata?: Metadata): Observable<SuccessResponse>;

  createContact(request: TokenSendRequest, metadata?: Metadata): Observable<SuccessResponse>;

  uploadDocument(request: UploadDocumentRequest, metadata?: Metadata): Observable<SuccessResponse>;

  documentCheck(request: AccountIdRequest, metadata?: Metadata): Observable<SuccessResponse>;
}

export interface PaymentGatewayServiceController {
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
}

export function PaymentGatewayServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createUser",
      "getToken",
      "createAccount",
      "updateAccount",
      "createContact",
      "uploadDocument",
      "documentCheck",
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
