/* eslint-disable */
import { Observable } from 'rxjs';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';

export interface GetTokenRequest {
  user_id: number;
}

export interface Token {
  token: string;
}

export interface TokenData {
  data: Token;
}

export interface PaymentGatewayService {
  getToken(request: GetTokenRequest): Observable<TokenData>;
}

export function PaymentGatewayControllerMethods() {

  return function (constructor: Function) {
    const grpcMethods: string[] = ['getToken'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod('PaymentGatewayService', method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod('PaymentGatewayService', method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PAYMENT_GATEWAY_SERVICE_NAME = 'PaymentGatewayService';
