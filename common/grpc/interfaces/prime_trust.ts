/* eslint-disable */
import { Observable } from 'rxjs';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import {IdRequest} from "~common/grpc/interfaces/common";


export interface TokenSendRequest {
  id: number;
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
  getToken(request: IdRequest): Observable<TokenData>;

  createAccount(request: TokenSendRequest): Observable<SuccessResponse>;

  createContact(request: TokenSendRequest): Observable<SuccessResponse>;
}

export function PaymentGatewayControllerMethods() {

  return function (constructor: Function) {
    const grpcMethods: string[] = ['getToken','createAccount','createContact'];
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
