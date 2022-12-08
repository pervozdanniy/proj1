/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "core";

export interface IdRequest {
  id: number;
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

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  phone?: string | undefined;
  email_verified_at?: string | undefined;
}

export interface DeleteResponse {
  success: boolean;
}

export const CORE_PACKAGE_NAME = "core";

export interface UserServiceClient {
  getById(request: IdRequest): Observable<User>;

  findByLogin(request: LoginRequest): Observable<User>;

  create(request: CreateRequest): Observable<User>;

  delete(request: IdRequest): Observable<DeleteResponse>;
}

export interface UserServiceController {
  getById(request: IdRequest): Promise<User> | Observable<User> | User;

  findByLogin(request: LoginRequest): Promise<User> | Observable<User> | User;

  create(request: CreateRequest): Promise<User> | Observable<User> | User;

  delete(request: IdRequest): Promise<DeleteResponse> | Observable<DeleteResponse> | DeleteResponse;
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
