/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "skopa.core";

export interface CreateNotificationRequest {
  user_id: number;
  description: string;
  title: string;
  type: string;
}

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
  search_after: number;
  limit: number;
  read?: boolean | undefined;
}

export interface NotificationListResponse {
  notifications: Notification[];
  has_more: boolean;
  last_id?: number | undefined;
}

export interface Notification {
  id: number;
  title: string;
  type: string;
  description: string;
  read: boolean;
  created_at: string;
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
