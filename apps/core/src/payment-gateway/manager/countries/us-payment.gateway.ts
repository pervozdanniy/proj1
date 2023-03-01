import { Injectable } from '@nestjs/common';
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
  MakeContributionRequest,
  TransferMethodRequest,
  WithdrawalParams,
  WithdrawalResponse,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankDepositInterface,
  BankInterface,
  CreditCardDepositInterface,
  PaymentGatewayInterface,
  PaymentMethods,
  WireDepositInterface,
  WithdrawalInterface,
} from '../../interfaces/payment-gateway.interface';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class USPaymentGateway
  implements
    PaymentGatewayInterface,
    BankInterface,
    WireDepositInterface,
    CreditCardDepositInterface,
    BankDepositInterface,
    WithdrawalInterface
{
  private primeTrustService: PrimeTrustService;

  constructor(primeTrustService: PrimeTrustService) {
    this.primeTrustService = primeTrustService;
  }
  addBank(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }

  createCreditCardResource(id: number): Promise<CreditCardResourceResponse> {
    return this.primeTrustService.createCreditCardResource(id);
  }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.primeTrustService.getBanksInfo(country);
  }

  getCreditCards(id: number): Promise<CreditCardsResponse> {
    return this.primeTrustService.getCreditCards(id);
  }

  makeDeposit(request: MakeContributionRequest): Promise<ContributionResponse> {
    return this.primeTrustService.makeContribution(request);
  }

  setDepositParams(request: DepositParamRequest): Promise<DepositResponse> {
    return this.primeTrustService.addDepositParams(request);
  }

  setWithdrawalParams(request: WithdrawalParams): Promise<WithdrawalResponse> {
    return this.primeTrustService.addWithdrawalParams(request);
  }

  verifyCreditCard(resource_id: string): Promise<SuccessResponse> {
    return this.primeTrustService.verifyCreditCard(resource_id);
  }

  getAvailablePaymentMethods(): PaymentMethods[] {
    return ['bank-transfer', 'credit-card'];
  }

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }
  createReference(request: CreateReferenceRequest): Promise<JsonData> {
    return this.primeTrustService.createReference(request);
  }

  addWithdrawalParams(request: WithdrawalParams): Promise<WithdrawalResponse> {
    return this.primeTrustService.addWithdrawalParams(request);
  }
  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    return this.primeTrustService.makeWithdrawal(request);
  }
}
