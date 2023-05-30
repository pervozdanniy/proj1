/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { UserIdRequest } from "./common";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "skopa.core";

export enum BlockReason {
  BR_UNSPECIFIED = 0,
  BR_CARD_LOST = 1,
  BR_CARD_STOLEN = 2,
  BR_CARD_INACTIVE = 5,
  BR_CARD_REPLACED = 8,
  UNRECOGNIZED = -1,
}

export interface CardId {
  reference: string;
  user_id: number;
}

export interface Card {
  reference: string;
  is_virtual: boolean;
  currency: string;
  status: string;
  pan?: string | undefined;
}

export interface CardsList {
  cards: Card[];
}

export interface ExpandedCardInfo {
  cvv: string;
  pan: string;
}

export interface CardDetails {
  reference: string;
  status: string;
  issue_date: string;
  type: string;
  brand: string;
  currency: string;
  expanded?: ExpandedCardInfo | undefined;
}

export interface IssueCardRequest {
  user_id: number;
  is_virtual: boolean;
  pin?: string | undefined;
}

export interface SetPinRequest {
  card_id: CardId | undefined;
  pin: string;
}

export interface RegenerateCvvResponse {
  cvv: string;
}

export interface BlockCardRequest {
  card_id: CardId | undefined;
  reason: BlockReason;
}

export interface ExternalBalanceEntry {
  currency: string;
  amount: number;
}

export interface ExternalBalanceResponse {
  balance: ExternalBalanceEntry[];
}

export interface ExternalPaymentMethodResponse {
  reference: string;
}

export interface ExternalWithdrawAuthorizationRequest {
  payload: Uint8Array;
}

export interface ExternalWithdrawAuthorizationResponse {
  authorization_id: string;
  status: string;
}

export interface ExternalWithdrawUpdateRequest {
  authorization_id: string;
  payload: Uint8Array;
}

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface CardsServiceClient {
  list(request: UserIdRequest, ...rest: any): Observable<CardsList>;

  issue(request: IssueCardRequest, ...rest: any): Observable<Card>;

  details(request: CardId, ...rest: any): Observable<CardDetails>;

  setPin(request: SetPinRequest, ...rest: any): Observable<Empty>;

  regenerateCvv(request: CardId, ...rest: any): Observable<RegenerateCvvResponse>;

  activate(request: CardId, ...rest: any): Observable<Empty>;

  deactivate(request: CardId, ...rest: any): Observable<Empty>;

  block(request: BlockCardRequest, ...rest: any): Observable<Empty>;

  unblock(request: CardId, ...rest: any): Observable<Empty>;
}

export interface CardsServiceController {
  list(request: UserIdRequest, ...rest: any): Promise<CardsList> | Observable<CardsList> | CardsList;

  issue(request: IssueCardRequest, ...rest: any): Promise<Card> | Observable<Card> | Card;

  details(request: CardId, ...rest: any): Promise<CardDetails> | Observable<CardDetails> | CardDetails;

  setPin(request: SetPinRequest, ...rest: any): void;

  regenerateCvv(
    request: CardId,
    ...rest: any
  ): Promise<RegenerateCvvResponse> | Observable<RegenerateCvvResponse> | RegenerateCvvResponse;

  activate(request: CardId, ...rest: any): void;

  deactivate(request: CardId, ...rest: any): void;

  block(request: BlockCardRequest, ...rest: any): void;

  unblock(request: CardId, ...rest: any): void;
}

export function CardsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "list",
      "issue",
      "details",
      "setPin",
      "regenerateCvv",
      "activate",
      "deactivate",
      "block",
      "unblock",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("CardsService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("CardsService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const CARDS_SERVICE_NAME = "CardsService";

export interface ExternalBalanceServiceClient {
  getBalance(request: UserIdRequest, ...rest: any): Observable<ExternalBalanceResponse>;

  getPaymentMethodReference(request: UserIdRequest, ...rest: any): Observable<ExternalPaymentMethodResponse>;
}

export interface ExternalBalanceServiceController {
  getBalance(
    request: UserIdRequest,
    ...rest: any
  ): Promise<ExternalBalanceResponse> | Observable<ExternalBalanceResponse> | ExternalBalanceResponse;

  getPaymentMethodReference(
    request: UserIdRequest,
    ...rest: any
  ): Promise<ExternalPaymentMethodResponse> | Observable<ExternalPaymentMethodResponse> | ExternalPaymentMethodResponse;
}

export function ExternalBalanceServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getBalance", "getPaymentMethodReference"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ExternalBalanceService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ExternalBalanceService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const EXTERNAL_BALANCE_SERVICE_NAME = "ExternalBalanceService";

export interface ExternalWithdrawAuthorizationServiceClient {
  authorize(
    request: ExternalWithdrawAuthorizationRequest,
    ...rest: any
  ): Observable<ExternalWithdrawAuthorizationResponse>;

  update(request: ExternalWithdrawUpdateRequest, ...rest: any): Observable<Empty>;
}

export interface ExternalWithdrawAuthorizationServiceController {
  authorize(
    request: ExternalWithdrawAuthorizationRequest,
    ...rest: any
  ):
    | Promise<ExternalWithdrawAuthorizationResponse>
    | Observable<ExternalWithdrawAuthorizationResponse>
    | ExternalWithdrawAuthorizationResponse;

  update(request: ExternalWithdrawUpdateRequest, ...rest: any): void;
}

export function ExternalWithdrawAuthorizationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["authorize", "update"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ExternalWithdrawAuthorizationService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ExternalWithdrawAuthorizationService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const EXTERNAL_WITHDRAW_AUTHORIZATION_SERVICE_NAME = "ExternalWithdrawAuthorizationService";
