/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "skopa.auth";

export interface AuthRequest {
  login: string;
  password: string;
}

export interface AuthData {
  access_token: string;
}

export interface ClientCreateRequest {
  name: string;
  pub_key?: string | undefined;
}

export interface ClientCreateResponse {
  name: string;
  key: string;
  secret?: string | undefined;
}

export interface ClientValidateRequest {
  api_key: string;
}

export interface ClientEncryptedRequest {
  api_key: string;
  encrypted_data: Uint8Array;
}

export interface ClientValidateEncryptedResponse {
  name: string;
  key: string;
  decrypted_data: string;
}

export const SKOPA_AUTH_PACKAGE_NAME = "skopa.auth";

export interface AuthServiceClient {
  login(request: AuthRequest, metadata?: Metadata): Observable<AuthData>;
}

export interface AuthServiceController {
  login(request: AuthRequest, metadata?: Metadata): Promise<AuthData> | Observable<AuthData> | AuthData;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["login"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const AUTH_SERVICE_NAME = "AuthService";

export interface ClientServiceClient {
  create(request: ClientCreateRequest, metadata?: Metadata): Observable<ClientCreateResponse>;

  validate(request: ClientValidateRequest, metadata?: Metadata): Observable<ClientCreateResponse>;

  validateEncrypted(request: ClientEncryptedRequest, metadata?: Metadata): Observable<ClientValidateEncryptedResponse>;

  login(request: ClientEncryptedRequest, metadata?: Metadata): Observable<AuthData>;
}

export interface ClientServiceController {
  create(
    request: ClientCreateRequest,
    metadata?: Metadata,
  ): Promise<ClientCreateResponse> | Observable<ClientCreateResponse> | ClientCreateResponse;

  validate(
    request: ClientValidateRequest,
    metadata?: Metadata,
  ): Promise<ClientCreateResponse> | Observable<ClientCreateResponse> | ClientCreateResponse;

  validateEncrypted(
    request: ClientEncryptedRequest,
    metadata?: Metadata,
  ):
    | Promise<ClientValidateEncryptedResponse>
    | Observable<ClientValidateEncryptedResponse>
    | ClientValidateEncryptedResponse;

  login(request: ClientEncryptedRequest, metadata?: Metadata): Promise<AuthData> | Observable<AuthData> | AuthData;
}

export function ClientServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["create", "validate", "validateEncrypted", "login"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ClientService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ClientService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const CLIENT_SERVICE_NAME = "ClientService";
