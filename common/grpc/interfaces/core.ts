/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { User } from "./common";

export const protobufPackage = "skopa.core";

export interface IdRequest {
  id: number;
}

export interface NullableUser {
  user?: User | undefined;
}

export interface CreateRequest {
  username: string;
  email: string;
  password: string;
  phone?: string | undefined;
}

export interface LoginRequest {
  login: string;
}

export interface DeleteResponse {
  success: boolean;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface UserServiceClient {
  getById(request: IdRequest, metadata?: Metadata): Observable<User>;

  findByLogin(request: LoginRequest, metadata?: Metadata): Observable<NullableUser>;

  create(request: CreateRequest, metadata?: Metadata): Observable<User>;

  delete(request: IdRequest, metadata?: Metadata): Observable<DeleteResponse>;
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
  ): Promise<DeleteResponse> | Observable<DeleteResponse> | DeleteResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getById", "findByLogin", "create", "delete"];
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
