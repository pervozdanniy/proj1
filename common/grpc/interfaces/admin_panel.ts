/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, NullableUser } from "./common";
import { Empty } from "./google/protobuf/empty";

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

export interface Transfer {
  id: number;
  user_id: number;
  receiver_id?: number | undefined;
  uuid?: string | undefined;
  param_id?: number | undefined;
  param_type?: string | undefined;
  type?: string | undefined;
  payment_type?: string | undefined;
  provider?: string | undefined;
  amount?: number | undefined;
  amount_usd?: number | undefined;
  fee?: number | undefined;
  currency_type?: string | undefined;
  status?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface Fee {
  id: number;
  country?: string | undefined;
  percent: number;
  fixed_usd?: number | undefined;
}

export interface UpdateFee {
  country?: string | undefined;
  percent?: number | undefined;
  fixed_usd?: number | undefined;
}

export interface CreateFeeArgument {
  country?: string | undefined;
  percent: number;
  fixed_usd?: number | undefined;
}

export interface TransferList {
  transfers: Transfer[];
  total: number;
}

export interface FeeList {
  fees: Fee[];
  total: number;
}

export interface UserList {
  users: UserBase[];
  total: number;
}

export interface PaginationArgument {
  pagination_params: string;
}

export interface UpdateUserStatusArgument {
  id: number;
  status: string;
}

export interface UpdateFeeArgument {
  id: number;
  data: UpdateFee | undefined;
}

export interface NullableUserBase {
  user?: UserBase | undefined;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface UserAdminServiceClient {
  getUserById(request: IdRequest, ...rest: any): Observable<NullableUser>;

  getUserList(request: PaginationArgument, ...rest: any): Observable<UserList>;

  updateUserStatus(request: UpdateUserStatusArgument, ...rest: any): Observable<NullableUserBase>;
}

export interface UserAdminServiceController {
  getUserById(request: IdRequest, ...rest: any): Promise<NullableUser> | Observable<NullableUser> | NullableUser;

  getUserList(request: PaginationArgument, ...rest: any): Promise<UserList> | Observable<UserList> | UserList;

  updateUserStatus(
    request: UpdateUserStatusArgument,
    ...rest: any
  ): Promise<NullableUserBase> | Observable<NullableUserBase> | NullableUserBase;
}

export function UserAdminServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getUserById", "getUserList", "updateUserStatus"];
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

export interface TransferAdminServiceClient {
  getTransferList(request: PaginationArgument, ...rest: any): Observable<TransferList>;
}

export interface TransferAdminServiceController {
  getTransferList(
    request: PaginationArgument,
    ...rest: any
  ): Promise<TransferList> | Observable<TransferList> | TransferList;
}

export function TransferAdminServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getTransferList"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("TransferAdminService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("TransferAdminService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const TRANSFER_ADMIN_SERVICE_NAME = "TransferAdminService";

export interface FeeAdminServiceClient {
  createFee(request: CreateFeeArgument, ...rest: any): Observable<Fee>;

  getFeeList(request: PaginationArgument, ...rest: any): Observable<FeeList>;

  updateFeeById(request: UpdateFeeArgument, ...rest: any): Observable<Fee>;

  deleteFeeById(request: IdRequest, ...rest: any): Observable<Empty>;
}

export interface FeeAdminServiceController {
  createFee(request: CreateFeeArgument, ...rest: any): Promise<Fee> | Observable<Fee> | Fee;

  getFeeList(request: PaginationArgument, ...rest: any): Promise<FeeList> | Observable<FeeList> | FeeList;

  updateFeeById(request: UpdateFeeArgument, ...rest: any): Promise<Fee> | Observable<Fee> | Fee;

  deleteFeeById(request: IdRequest, ...rest: any): void;
}

export function FeeAdminServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createFee", "getFeeList", "updateFeeById", "deleteFeeById"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("FeeAdminService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("FeeAdminService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const FEE_ADMIN_SERVICE_NAME = "FeeAdminService";
