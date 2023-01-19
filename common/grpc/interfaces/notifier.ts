/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { SuccessResponse } from "./common";

export const protobufPackage = "skopa.notifier";

export interface NotifyRequest {
  title: string;
  description: string;
}

export interface UserData {
  username: string;
  email?: string | undefined;
  phone?: string | undefined;
  send_type: number;
}

export interface AddNotificationRequest {
  notification: NotifyRequest | undefined;
  user_data: UserData | undefined;
}

export const SKOPA_NOTIFIER_PACKAGE_NAME = "skopa.notifier";

export interface NotifierServiceClient {
  add(request: AddNotificationRequest, metadata?: Metadata): Observable<SuccessResponse>;
}

export interface NotifierServiceController {
  add(
    request: AddNotificationRequest,
    metadata?: Metadata,
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
