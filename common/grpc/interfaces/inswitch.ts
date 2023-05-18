/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "skopa.core";

export interface UserId {
  user_id: number;
}

export interface CardId {
  reference: string;
  user_id: number;
}

export interface Card {
  reference: string;
  is_virtual: boolean;
  currency: string;
  pan?: string | undefined;
}

export interface CardsList {
  cards: Card[];
}

export interface ExpandedCardInfo {
  cvv: string;
  pan: string;
}

export interface CreateCardRequest {
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

export const SKOPA_CORE_PACKAGE_NAME = "skopa.core";

export interface CardsServiceClient {
  getCards(request: UserId, ...rest: any): Observable<CardsList>;

  createCard(request: CreateCardRequest, ...rest: any): Observable<Card>;

  getExpandedInfo(request: CardId, ...rest: any): Observable<ExpandedCardInfo>;

  setPin(request: SetPinRequest, ...rest: any): Observable<Empty>;

  regenerateCvv(request: CardId, ...rest: any): Observable<RegenerateCvvResponse>;
}

export interface CardsServiceController {
  getCards(request: UserId, ...rest: any): Promise<CardsList> | Observable<CardsList> | CardsList;

  createCard(request: CreateCardRequest, ...rest: any): Promise<Card> | Observable<Card> | Card;

  getExpandedInfo(
    request: CardId,
    ...rest: any
  ): Promise<ExpandedCardInfo> | Observable<ExpandedCardInfo> | ExpandedCardInfo;

  setPin(request: SetPinRequest, ...rest: any): void;

  regenerateCvv(
    request: CardId,
    ...rest: any
  ): Promise<RegenerateCvvResponse> | Observable<RegenerateCvvResponse> | RegenerateCvvResponse;
}

export function CardsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getCards", "createCard", "getExpandedInfo", "setPin", "regenerateCvv"];
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
