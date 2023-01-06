/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, SuccessResponse, User, UserDetails } from "./common";

export const protobufPackage = "skopa.core";

export interface NullableUser {
  user?: User | undefined;
}

export interface UpdateRequest {
  id: number;
  username: string;
  country_id?: number | undefined;
  phone?: string | undefined;
  source?: string | undefined;
  details?: UserDetails | undefined;
}

export interface CreateRequest {
  username: string;
  email: string;
  password?: string | undefined;
  phone?: string | undefined;
  country_id?: number | undefined;
  source?: string | undefined;
  details?: UserDetails | undefined;
}

export interface LoginRequest {
  login: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface UserServiceClient {
  getById(request: IdRequest, metadata?: Metadata): Observable<User>;

  findByLogin(request: LoginRequest, metadata?: Metadata): Observable<NullableUser>;

  create(request: CreateRequest, metadata?: Metadata): Observable<User>;

  delete(request: IdRequest, metadata?: Metadata): Observable<SuccessResponse>;

  update(request: UpdateRequest, metadata?: Metadata): Observable<User>;
}

export interface UserServiceController {
  getById(request: IdRequest, metadata?: Metadata): Promise<User> | Observable<User> | User;

  findByLogin(
    request: LoginRequest,
    metadata?: Metadata,
  ): Promise<NullableUser> | Observable<NullableUser> | NullableUser;

  create(request: CreateRequest, metadata?: Metadata): Promise<User> | Observable<User> | User;

  delete(
    request: IdRequest,
    metadata?: Metadata,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  update(request: UpdateRequest, metadata?: Metadata): Promise<User> | Observable<User> | User;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getById", "findByLogin", "create", "delete", "update"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_SERVICE_NAME = "UserService";
