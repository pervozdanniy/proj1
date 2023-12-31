/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { SuccessResponse } from "./common";

export const protobufPackage = "skopa.websocket";

export interface WsMessage {
  event: string;
  data?: string | undefined;
}

export interface WsUserMessage {
  user_id: number;
  message: WsMessage | undefined;
}

export const SKOPA_WEBSOCKET_PACKAGE_NAME = "skopa.websocket";

export interface WebsocketServiceClient {
  send(request: WsMessage, ...rest: any): Observable<SuccessResponse>;

  sendTo(request: WsUserMessage, ...rest: any): Observable<SuccessResponse>;
}

export interface WebsocketServiceController {
  send(request: WsMessage, ...rest: any): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  sendTo(
    request: WsUserMessage,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;
}

export function WebsocketServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["send", "sendTo"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("WebsocketService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("WebsocketService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const WEBSOCKET_SERVICE_NAME = "WebsocketService";
