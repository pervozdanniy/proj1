/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "skopa.core";

export interface CountryListResponse {
  items: Country[];
}

export interface Country {
  code: string;
  name: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface CountryServiceClient {
  list(request: Empty, ...rest: any): Observable<CountryListResponse>;
}

export interface CountryServiceController {
  list(
    request: Empty,
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
