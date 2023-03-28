/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { IdRequest, SuccessResponse, User, UserDetails } from "./common";

export const protobufPackage = "skopa.core";

export interface ContactsResponse {
  contacts: Contact[];
  has_more: boolean;
  last_id?: number | undefined;
}

export interface Contact {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export interface SearchContactRequest {
  user_id: number;
  search_after: number;
  limit: number;
  search_term?: string | undefined;
}

export interface VerifyRequest {
  id: number;
  socure_verify: boolean;
  document_uuid: string;
}

export interface NullableUser {
  user?: User | undefined;
}

export interface UserContacts {
  new: string[];
  removed: string[];
}

export interface UpdateRequest {
  id: number;
  email?: string | undefined;
  country_code?: string | undefined;
  phone?: string | undefined;
  password?: string | undefined;
  status?: string | undefined;
  details?: UserDetails | undefined;
  contacts?: UserContacts | undefined;
}

export interface CreateRequest {
  email: string;
  password?: string | undefined;
  phone?: string | undefined;
  country_code?: string | undefined;
  source?: string | undefined;
  status?: string | undefined;
  details?: UserDetails | undefined;
  contacts: string[];
}

export interface FindByLoginRequest {
  email?: string | undefined;
  phone?: string | undefined;
}

export interface UpdateContactsRequest {
  user_id: number;
  contacts: UserContacts | undefined;
}

export interface CheckIfUniqueRequest {
  email: string;
  phone: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface UserServiceClient {
  getById(request: IdRequest, ...rest: any): Observable<User>;

  verifySocure(request: VerifyRequest, ...rest: any): Observable<SuccessResponse>;

  findByLogin(request: FindByLoginRequest, ...rest: any): Observable<NullableUser>;

  create(request: CreateRequest, ...rest: any): Observable<User>;

  delete(request: IdRequest, ...rest: any): Observable<SuccessResponse>;

  update(request: UpdateRequest, ...rest: any): Observable<User>;

  updateContacts(request: UpdateContactsRequest, ...rest: any): Observable<User>;

  checkIfUnique(request: CheckIfUniqueRequest, ...rest: any): Observable<SuccessResponse>;

  getContacts(request: SearchContactRequest, ...rest: any): Observable<ContactsResponse>;
}

export interface UserServiceController {
  getById(request: IdRequest, ...rest: any): Promise<User> | Observable<User> | User;

  verifySocure(
    request: VerifyRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  findByLogin(
    request: FindByLoginRequest,
    ...rest: any
  ): Promise<NullableUser> | Observable<NullableUser> | NullableUser;

  create(request: CreateRequest, ...rest: any): Promise<User> | Observable<User> | User;

  delete(request: IdRequest, ...rest: any): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  update(request: UpdateRequest, ...rest: any): Promise<User> | Observable<User> | User;

  updateContacts(request: UpdateContactsRequest, ...rest: any): Promise<User> | Observable<User> | User;

  checkIfUnique(
    request: CheckIfUniqueRequest,
    ...rest: any
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse;

  getContacts(
    request: SearchContactRequest,
    ...rest: any
  ): Promise<ContactsResponse> | Observable<ContactsResponse> | ContactsResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getById",
      "verifySocure",
      "findByLogin",
      "create",
      "delete",
      "update",
      "updateContacts",
      "checkIfUnique",
      "getContacts",
    ];
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
