/* eslint-disable */
import { Observable } from 'rxjs';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';

export interface UserIdRequest {
  user_id: number;
}

export interface CreateAccountRequest {
  user_id: number;

  token:string;
}

export interface Token {
  token: string;
}

export interface TokenData {
  data: Token;
}

export interface SuccessResponse {
  success: boolean;
}

export interface PaymentGatewayService {
  getToken(request: UserIdRequest): Observable<TokenData>;

  createAccount(request: CreateAccountRequest): Observable<SuccessResponse>;
}

export function PaymentGatewayControllerMethods() {

  return function (constructor: Function) {
    const grpcMethods: string[] = ['getToken','createAccount'];
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
