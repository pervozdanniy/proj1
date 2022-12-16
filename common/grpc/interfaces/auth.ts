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

