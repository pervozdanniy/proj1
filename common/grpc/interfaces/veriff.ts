/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { UserIdRequest } from "./common";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "skopa.core";

export interface Person {
  gender?: string | undefined;
  idNumber?: string | undefined;
  lastName: string;
  firstName: string;
  citizenship?: string | undefined;
  dateOfBirth?: string | undefined;
  nationality?: string | undefined;
  yearOfBirth?: string | undefined;
  placeOfBirth?: string | undefined;
  pepSanctionMatch?: boolean | undefined;
}

export interface Document {
  type: string;
  number: string;
  country: string;
  validFrom?: string | undefined;
  validUntil?: string | undefined;
}

export interface Verification {
  id: string;
  code: number;
  person?: Person | undefined;
  reason?: string | undefined;
  status: string;
  comments: string[];
  document: Document | undefined;
  reasonCode?: string | undefined;
  vendorData: string;
  decisionTime: string;
  acceptanceTime: string;
  additionalVerifiedData: { [key: string]: string };
}

export interface Verification_AdditionalVerifiedDataEntry {
  key: string;
  value: string;
}

export interface TechnicalData {
  ip: string;
}

export interface DecisionWebhook {
  status: string;
  verification: Verification | undefined;
  technicalData: TechnicalData | undefined;
}

export interface EventWebhook {
  id: string;
  attemptId: string;
  action: string;
}

export interface VeriffSessionResponse {
  status: string;
  verification: VeriffSessionVerification | undefined;
}

export interface VeriffSessionVerification {
  id: string;
  url: string;
  vendorData: string;
  host: string;
  status: string;
  sessionToken: string;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface KYCServiceClient {
  generateLink(request: UserIdRequest, ...rest: any): Observable<VeriffSessionResponse>;

  eventHandler(request: EventWebhook, ...rest: any): Observable<Empty>;

  decisionHandler(request: DecisionWebhook, ...rest: any): Observable<Empty>;
}

export interface KYCServiceController {
  generateLink(
    request: UserIdRequest,
    ...rest: any
  ): Promise<VeriffSessionResponse> | Observable<VeriffSessionResponse> | VeriffSessionResponse;

  eventHandler(request: EventWebhook, ...rest: any): void;

  decisionHandler(request: DecisionWebhook, ...rest: any): void;
}

export function KYCServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["generateLink", "eventHandler", "decisionHandler"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("KYCService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("KYCService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const K_YC_SERVICE_NAME = "KYCService";
