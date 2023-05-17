/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "skopa.core.inswitch";

export interface UserIdRequest {
  user_id: number;
}

export interface CardDetailsRequest {
  reference: string;
  user_id: number;
}

export interface Card {
  reference: string;
  is_virtual: boolean;
  currency: string;
  pan: string;
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

export const SKOPA_CORE_INSWITCH_PACKAGE_NAME = "skopa.core.inswitch";

export interface CardsServiceClient {
  getCards(request: UserIdRequest, ...rest: any): Observable<CardsList>;

  createCard(request: CreateCardRequest, ...rest: any): Observable<Card>;

  getExpandedInfo(request: CardDetailsRequest, ...rest: any): Observable<ExpandedCardInfo>;
}

export interface CardsServiceController {
  getCards(request: UserIdRequest, ...rest: any): Promise<CardsList> | Observable<CardsList> | CardsList;

  createCard(request: CreateCardRequest, ...rest: any): Promise<Card> | Observable<Card> | Card;

  getExpandedInfo(
    request: CardDetailsRequest,
    ...rest: any
  ): Promise<ExpandedCardInfo> | Observable<ExpandedCardInfo> | ExpandedCardInfo;
}

export function CardsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getCards", "createCard", "getExpandedInfo"];
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
