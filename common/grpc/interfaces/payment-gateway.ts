/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "skopa.core";

export interface PG_GetTokenRequest {
  user_id: number;
}

export interface PG_Token {
  data: Token_Data | undefined;
}

export interface Token_Data {
  token: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface PaymentGatewayServiceClient {
  getToken(request: PG_GetTokenRequest, metadata?: Metadata): Observable<PG_Token>;
}

export interface PaymentGatewayServiceController {
  getToken(request: PG_GetTokenRequest, metadata?: Metadata): Promise<PG_Token> | Observable<PG_Token> | PG_Token;
}

export function PaymentGatewayServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getToken"];
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
