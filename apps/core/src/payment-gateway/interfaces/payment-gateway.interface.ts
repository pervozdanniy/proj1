import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  CreateReferenceRequest,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositParamRequest,
  DepositRedirectData,
  DepositResponse,
  JsonData,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';

export type MakeDepositRequest = {
  id: number;
  funds_transfer_method_id: string;
  amount: string;
  cvv?: string;
};

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

export interface CreditCardInterface {
  verifyCreditCard(resource_id: string, transfer_method_id: string): Promise<SuccessResponse>;

  getCreditCards(userId: number): Promise<CreditCardsResponse>;

  createCreditCardResource(userId: number): Promise<CreditCardResourceResponse>;
}

export interface BankDepositInterface extends BankInterface, DepositInterface {
  setDepositParams(request: DepositParamRequest): Promise<DepositResponse>;
}

export interface DepositInterface {
  makeDeposit(request: MakeDepositRequest): Promise<TransferInfo>;
}

export interface BankWithdrawalInterface extends BankInterface {
  makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo>;
}
