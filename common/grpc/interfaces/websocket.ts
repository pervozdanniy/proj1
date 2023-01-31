/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { SuccessResponse } from "./common";

export const protobufPackage = "skopa.websocket";

export interface WsMessage {
  event: string;
  data?: string | undefined;
}

export const SKOPA_WEBSOCKET_PACKAGE_NAME = "skopa.websocket";

export interface WebsocketServiceClient {
  send(request: WsMessage, metadata?: Metadata): Observable<SuccessResponse>;
}

export interface WebsocketServiceController {
  send(
    request: WsMessage,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;
}

export function WebsocketServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["send"];
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
