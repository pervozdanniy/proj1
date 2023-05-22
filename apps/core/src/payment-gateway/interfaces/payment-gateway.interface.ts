import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  BankAccountParams,
  BankCredentialsData,
  BanksInfoResponse,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositParamRequest,
  DepositRedirectData,
  DepositResponse,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';

export type MakeDepositRequest = {
  id: number;
  funds_transfer_method_id: string;
  amount: number;
  cvv?: string;
};

export interface CreateReferenceRequest {
  id: number;
  amount: number;
  currency_type: string;
}

export type PaymentMethod = 'bank-transfer' | 'credit-card' | 'cash';

export interface PaymentGatewayInterface {
  getAvailablePaymentMethods(): PaymentMethod[];
}

export interface BankInterface extends PaymentGatewayInterface {
  addBank(request: BankAccountParams): Promise<BankAccountParams>;

  getAvailableBanks(country: string): Promise<BanksInfoResponse>;
}

export interface CreditCardInterface extends PaymentGatewayInterface {
  verifyCreditCard(resource_id: string, transfer_method_id: string): Promise<SuccessResponse>;

  getCreditCards(userId: number): Promise<CreditCardsResponse>;

  createCreditCardResource(userId: number): Promise<CreditCardResourceResponse>;
}

export type CashInterface = PaymentGatewayInterface;

export interface RedirectDepositInterface {
  createRedirectReference(request: CreateReferenceRequest): Promise<DepositRedirectData>;
}

export interface WireDepositInterface {
  createWireReference(request: CreateReferenceRequest): Promise<BankCredentialsData>;
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
