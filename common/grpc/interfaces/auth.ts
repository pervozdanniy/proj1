/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "skopa.auth";

export interface SocialsAuthRequest {
  username: string;
  email: string;
  source: string;
}

export interface GoogleAuthRequest {
  token: string;
}

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

export interface AuthClient {
  name: string;
  key: string;
  is_secure: boolean;
}

export interface SignedRequest {
  data: Uint8Array;
  signature?: Uint8Array | undefined;
}

export interface ClientLoginRequest {
  login: string;
  password?: string | undefined;
}

export const SKOPA_AUTH_PACKAGE_NAME = "skopa.auth";

export interface AuthServiceClient {
  login(request: AuthRequest, metadata?: Metadata): Observable<AuthData>;

  loginSocials(request: SocialsAuthRequest, metadata?: Metadata): Observable<AuthData>;
}

export interface AuthServiceController {
  login(request: AuthRequest, metadata?: Metadata): Promise<AuthData> | Observable<AuthData> | AuthData;

  loginSocials(request: SocialsAuthRequest, metadata?: Metadata): Promise<AuthData> | Observable<AuthData> | AuthData;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["login", "loginSocials"];
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
  create(request: ClientCreateRequest, metadata?: Metadata): Observable<AuthClient>;

  validate(request: SignedRequest, metadata?: Metadata): Observable<AuthClient>;

  login(request: SignedRequest, metadata?: Metadata): Observable<AuthData>;
}

export interface ClientServiceController {
  create(request: ClientCreateRequest, metadata?: Metadata): Promise<AuthClient> | Observable<AuthClient> | AuthClient;

  validate(request: SignedRequest, metadata?: Metadata): Promise<AuthClient> | Observable<AuthClient> | AuthClient;

  login(request: SignedRequest, metadata?: Metadata): Promise<AuthData> | Observable<AuthData> | AuthData;
}

export function ClientServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["create", "validate", "login"];
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
