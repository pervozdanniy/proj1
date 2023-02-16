/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { SuccessResponse } from "./common";

export const protobufPackage = "skopa.notifier";

export enum SendType {
  SEND_TYPE_UNSPECIFIED = 0,
  SEND_TYPE_EMAIL = 1,
  SEND_TYPE_SMS = 2,
  SEND_TYPE_ALL = 3,
  UNRECOGNIZED = -1,
}

export interface NotifyRequest {
  body: string;
  title?: string | undefined;
}

export interface NotifyOptions {
  send_type: SendType;
  email?: string | undefined;
  phone?: string | undefined;
}

export interface AddNotificationRequest {
  notification: NotifyRequest | undefined;
  options: NotifyOptions | undefined;
}

export const SKOPA_NOTIFIER_PACKAGE_NAME = "skopa.notifier";

export interface NotifierServiceClient {
  add(request: AddNotificationRequest, ...rest: any): Observable<SuccessResponse>;
}

export interface NotifierServiceController {
  add(
    request: AddNotificationRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;
}

export function NotifierServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["add"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("NotifierService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("NotifierService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const NOTIFIER_SERVICE_NAME = "NotifierService";
