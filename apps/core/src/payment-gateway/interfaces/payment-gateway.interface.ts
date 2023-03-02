import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  ContributionResponse,
  CreateReferenceRequest,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositParamRequest,
  DepositResponse,
  JsonData,
  MakeDepositRequest,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';

export type PaymentMethods = 'bank-transfer' | 'credit-card';

export interface PaymentGatewayInterface {
  getAvailablePaymentMethods(): PaymentMethods[] | Promise<PaymentMethods[]>;
}

export interface BankInterface {
  addBank(request: BankAccountParams): Promise<BankAccountParams>;

  getAvailableBanks(country: string): Promise<BanksInfoResponse>;
}

export interface WireDepositInterface {
  createReference(request: CreateReferenceRequest): Promise<JsonData>;
}

export interface CreditCardDepositInterface {
  verifyCreditCard(resource_id: string): Promise<SuccessResponse>;

  getCreditCards(id: number): Promise<CreditCardsResponse>;

  createCreditCardResource(id: number): Promise<CreditCardResourceResponse>;
}

export interface BankDepositInterface {
  makeDeposit(request: MakeDepositRequest): Promise<ContributionResponse>;

  setDepositParams(request: DepositParamRequest): Promise<DepositResponse>;
}

export interface WithdrawalInterface {
  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData>;
}
