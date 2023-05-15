import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  ContributionResponse,
  CreateReferenceRequest,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositParamRequest,
  DepositRedirectData,
  DepositResponse,
  JsonData,
  MakeDepositRequest,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';

export type PaymentMethod = 'bank-transfer' | 'credit-card' | 'cash';

export interface PaymentGatewayInterface {
  getAvailablePaymentMethods(): PaymentMethod[];
}

export interface BankInterface {
  addBank(request: BankAccountParams): Promise<BankAccountParams>;

  getAvailableBanks(country: string): Promise<BanksInfoResponse>;
}

export interface RedirectDepositInterface {
  createRedirectReference(request: CreateReferenceRequest): Promise<DepositRedirectData>;
}

export interface WireDepositInterface {
  createReference(request: CreateReferenceRequest): Promise<JsonData>;
}

export interface CashDepositInterface {
  createRedirectReference(request: CreateReferenceRequest): Promise<DepositRedirectData>;
}

export interface CreditCardInterface {
  verifyCreditCard(resource_id: string, transfer_method_id: string): Promise<SuccessResponse>;

  getCreditCards(userId: number): Promise<CreditCardsResponse>;

  createCreditCardResource(userId: number): Promise<CreditCardResourceResponse>;
}

export interface BankDepositInterface extends BankInterface, DepositInterface {
  setDepositParams(request: DepositParamRequest): Promise<DepositResponse>;
}

export interface DepositInterface {
  makeDeposit(request: MakeDepositRequest): Promise<ContributionResponse>;
}

export interface BankWithdrawalInterface extends BankInterface {
  makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo>;
}
