/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { SuccessResponse, User, UserDetails } from "./common";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "skopa.auth";

export interface AuthRequest {
  login: string;
  password: string;
}

export interface Verification {
  type: string;
  methods: string[];
}

export interface AuthData {
  access_token: string;
  verify?: Verification | undefined;
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

export interface SocialsAuthRequest {
  username: string;
  email: string;
  source: string;
}

export interface TwoFactorSettings {
  method: string;
  destination?: string | undefined;
}

export interface TwoFactorEnableRequest {
  settings: TwoFactorSettings | undefined;
}

export interface TwoFactorDisableRequest {
  methods: string[];
}

export interface TwoFactorEnabledMethodsResponse {
  methods: string[];
}

export interface TwoFactorCode {
  method: string;
  code: number;
}

export interface TwoFactorVerificationRequest {
  codes: TwoFactorCode[];
}

export interface TwoFactorVerificationResponse {
  valid: boolean;
  reason?: string | undefined;
  unverified?: TwoFactorEnabledMethodsResponse | undefined;
}

export interface TwoFactorRequireResponse {
  required?: TwoFactorEnabledMethodsResponse | undefined;
  error?: string | undefined;
}

export interface RegisterStartRequest {
  email: string;
  phone: string;
  password: string;
}

export interface RegisterFinishRequest {
  username: string;
  country_id: number;
  details?: UserDetails | undefined;
  contacts: string[];
}

export const SKOPA_AUTH_PACKAGE_NAME = "skopa.auth";

export interface AuthServiceClient {
  login(request: AuthRequest, ...rest: any): Observable<AuthData>;

  logout(request: Empty, ...rest: any): Observable<SuccessResponse>;

  loginSocials(request: SocialsAuthRequest, ...rest: any): Observable<AuthData>;

  registerStart(request: RegisterStartRequest, ...rest: any): Observable<AuthData>;

  registerVerify(request: TwoFactorCode, ...rest: any): Observable<TwoFactorVerificationResponse>;

  registerFinish(request: RegisterFinishRequest, ...rest: any): Observable<User>;
}

export interface AuthServiceController {
  login(request: AuthRequest, ...rest: any): Promise<AuthData> | Observable<AuthData> | AuthData;

  logout(request: Empty, ...rest: any): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  loginSocials(request: SocialsAuthRequest, ...rest: any): Promise<AuthData> | Observable<AuthData> | AuthData;

  registerStart(request: RegisterStartRequest, ...rest: any): Promise<AuthData> | Observable<AuthData> | AuthData;

  registerVerify(
    request: TwoFactorCode,
    ...rest: any
  ): Promise<TwoFactorVerificationResponse> | Observable<TwoFactorVerificationResponse> | TwoFactorVerificationResponse;

  registerFinish(request: RegisterFinishRequest, ...rest: any): Promise<User> | Observable<User> | User;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "login",
      "logout",
      "loginSocials",
      "registerStart",
      "registerVerify",
      "registerFinish",
    ];
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
  create(request: ClientCreateRequest, ...rest: any): Observable<AuthClient>;

  validate(request: SignedRequest, ...rest: any): Observable<AuthClient>;

  login(request: SignedRequest, ...rest: any): Observable<AuthData>;
}

export interface ClientServiceController {
  create(request: ClientCreateRequest, ...rest: any): Promise<AuthClient> | Observable<AuthClient> | AuthClient;

  validate(request: SignedRequest, ...rest: any): Promise<AuthClient> | Observable<AuthClient> | AuthClient;

  login(request: SignedRequest, ...rest: any): Promise<AuthData> | Observable<AuthData> | AuthData;
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

export interface TwoFactorServiceClient {
  list(request: Empty, ...rest: any): Observable<TwoFactorEnabledMethodsResponse>;

  enable(request: TwoFactorEnableRequest, ...rest: any): Observable<SuccessResponse>;

  disable(request: TwoFactorDisableRequest, ...rest: any): Observable<SuccessResponse>;

  verify(request: TwoFactorVerificationRequest, ...rest: any): Observable<TwoFactorVerificationResponse>;

  verifyOne(request: TwoFactorCode, ...rest: any): Observable<TwoFactorVerificationResponse>;

  require(request: Empty, ...rest: any): Observable<TwoFactorRequireResponse>;

  resend(request: TwoFactorSettings, ...rest: any): Observable<SuccessResponse>;
}

export interface TwoFactorServiceController {
  list(
    request: Empty,
    ...rest: any
  ):
    | Promise<TwoFactorEnabledMethodsResponse>
    | Observable<TwoFactorEnabledMethodsResponse>
    | TwoFactorEnabledMethodsResponse;

  enable(
    request: TwoFactorEnableRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  disable(
    request: TwoFactorDisableRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  verify(
    request: TwoFactorVerificationRequest,
    ...rest: any
  ): Promise<TwoFactorVerificationResponse> | Observable<TwoFactorVerificationResponse> | TwoFactorVerificationResponse;

  verifyOne(
    request: TwoFactorCode,
    ...rest: any
  ): Promise<TwoFactorVerificationResponse> | Observable<TwoFactorVerificationResponse> | TwoFactorVerificationResponse;

  require(
    request: Empty,
    ...rest: any
  ): Promise<TwoFactorRequireResponse> | Observable<TwoFactorRequireResponse> | TwoFactorRequireResponse;

  resend(
    request: TwoFactorSettings,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;
}

export function TwoFactorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["list", "enable", "disable", "verify", "verifyOne", "require", "resend"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("TwoFactorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("TwoFactorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const TWO_FACTOR_SERVICE_NAME = "TwoFactorService";
