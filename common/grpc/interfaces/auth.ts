/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { User } from "./common";

export const protobufPackage = "skopa.auth";

export interface AuthRequest {
  login: string;
  password: string;
}

export interface AuthData {
  access_token: string;
}

export interface MeRequest {
}

export interface AuthorizedUser {
  id: number;
  username: string;
}

export const SKOPA_AUTH_PACKAGE_NAME = "skopa.auth";

export interface AuthServiceClient {
  me(request: MeRequest, metadata?: Metadata): Observable<User>;

  login(request: AuthRequest, metadata?: Metadata): Observable<AuthData>;
}

export interface AuthServiceController {
  me(request: MeRequest, metadata?: Metadata): Promise<User> | Observable<User> | User;

  login(request: AuthRequest, metadata?: Metadata): Promise<AuthData> | Observable<AuthData> | AuthData;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["me", "login"];
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
