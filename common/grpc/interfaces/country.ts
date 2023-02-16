/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "skopa.core";

export interface CountryListQuery {
  limit: number;
  offset: number;
}

export interface CountryListResponse {
  items: Country[];
  count: number;
}

export interface Country {
  id: number;
  code: string;
  name: string;
  payment_gateway_id: number;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface CountryServiceClient {
  list(request: CountryListQuery, ...rest: any): Observable<CountryListResponse>;
}

export interface CountryServiceController {
  list(
    request: CountryListQuery,
    ...rest: any
  ): Promise<CountryListResponse> | Observable<CountryListResponse> | CountryListResponse;
}

export function CountryServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["list"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("CountryService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("CountryService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const COUNTRY_SERVICE_NAME = "CountryService";
