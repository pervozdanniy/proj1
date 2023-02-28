import {
  BankAccountParams,
  CreateReferenceRequest,
  JsonData,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';

export type PaymentMethods = 'bank-transfer' | 'credit-card';

export interface PaymentGatewayInterface {
  getAvailablePaymentMethods(): PaymentMethods[] | Promise<PaymentMethods[]>;

  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData>;

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams>;

  createReference(request: CreateReferenceRequest): Promise<JsonData>;
}
