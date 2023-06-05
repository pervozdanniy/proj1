/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, NullableUser } from "./common";

export const protobufPackage = "skopa.core";

export interface UserBase {
  id: number;
  email: string;
  country_code: string;
  phone?: string | undefined;
  status: string;
  email_verified_at?: string | undefined;
  created_at: string;
  updated_at: string;
  source: string;
}

export interface UserList {
  users: UserBase[];
  total: number;
}

export interface UserListArgument {
  pagination_params: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface UserAdminServiceClient {
  getUserById(request: IdRequest, ...rest: any): Observable<NullableUser>;

  getUserList(request: UserListArgument, ...rest: any): Observable<UserList>;
}

export interface UserAdminServiceController {
  getUserById(request: IdRequest, ...rest: any): Promise<NullableUser> | Observable<NullableUser> | NullableUser;

  getUserList(request: UserListArgument, ...rest: any): Promise<UserList> | Observable<UserList> | UserList;
}

export function UserAdminServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getUserById", "getUserList"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserAdminService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserAdminService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_ADMIN_SERVICE_NAME = "UserAdminService";
