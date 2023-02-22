import {
  BankAccountParams,
  CreateReferenceRequest,
  JsonData,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';

export interface PaymentGatewayInterface {
  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData>;

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams>;

  createReference(request: CreateReferenceRequest): Promise<JsonData>;
}
