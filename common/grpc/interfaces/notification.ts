/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "skopa.core";

export interface NotificationPayload {
  id: number;
  read: boolean;
}

export interface UpdateNotificationRequest {
  id: number;
  payload: NotificationPayload | undefined;
}

export interface NotificationRequest {
  id: number;
  limit: number;
  offset: number;
  read?: boolean | undefined;
}

export interface NotificationListResponse {
  items: Notification[];
  count: number;
}

export interface Notification {
  id: number;
  title: string;
  type: string;
  description: string;
  read: boolean;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface NotificationServiceClient {
  list(request: NotificationRequest, ...rest: any): Observable<NotificationListResponse>;

  update(request: UpdateNotificationRequest, ...rest: any): Observable<Notification>;
}

export interface NotificationServiceController {
  list(
    request: NotificationRequest,
    ...rest: any
  ): Promise<NotificationListResponse> | Observable<NotificationListResponse> | NotificationListResponse;

  update(
    request: UpdateNotificationRequest,
    ...rest: any
  ): Promise<Notification> | Observable<Notification> | Notification;
}

export function NotificationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["list", "update"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("NotificationService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("NotificationService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const NOTIFICATION_SERVICE_NAME = "NotificationService";
