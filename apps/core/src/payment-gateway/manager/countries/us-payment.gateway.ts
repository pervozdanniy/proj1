import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  DepositParamRequest,
  DepositResponse,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankDepositInterface,
  BankWithdrawalInterface,
  MakeDepositRequest,
  PaymentGatewayInterface,
  PaymentMethod,
} from '../../interfaces/payment-gateway.interface';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class USPaymentGateway implements PaymentGatewayInterface, BankDepositInterface, BankWithdrawalInterface {
  private primeTrustService: PrimeTrustService;

  constructor(primeTrustService: PrimeTrustService) {
    this.primeTrustService = primeTrustService;
  }

  getAvailablePaymentMethods(): PaymentMethod[] {
    return ['bank-transfer'];
  }

  addBank(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }

  // createCreditCardResource(userId: number): Promise<CreditCardResourceResponse> {
  //   return this.primeTrustService.createCreditCardResource(userId);
  // }

  // verifyCreditCard(resource_id: string, transfer_method_id: string): Promise<SuccessResponse> {
  //   return this.primeTrustService.verifyCreditCard(resource_id, transfer_method_id);
  // }

  // getCreditCards(id: number): Promise<CreditCardsResponse> {
  //   return this.primeTrustService.getCreditCards(id);
  // }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.primeTrustService.getBanksInfo(country);
  }

  makeDeposit(request: MakeDepositRequest): Promise<TransferInfo> {
    return this.primeTrustService.makeDeposit(request);
  }

  setDepositParams(request: DepositParamRequest): Promise<DepositResponse> {
    return this.primeTrustService.addDepositParams(request);
  }

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }

  makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    return this.primeTrustService.makeWithdrawal(request);
  }
}
