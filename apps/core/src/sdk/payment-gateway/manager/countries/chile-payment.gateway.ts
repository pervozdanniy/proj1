import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BankAccountsResponse,
  CreateReferenceRequest,
  PrimeTrustData,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { PaymentGatewayInterface } from '../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../services/koywe/koywe.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class ChilePaymentGateway implements PaymentGatewayInterface {
  private primeTrustService: PrimeTrustService;
  private koyweService: KoyweService;
  constructor(primeTrustService: PrimeTrustService, koyweService: KoyweService) {
    this.primeTrustService = primeTrustService;
    this.koyweService = koyweService;
  }

  getBankAccounts(request: number): Promise<BankAccountsResponse> {
    return this.primeTrustService.getBankAccounts(request);
  }
  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }

  async createReference(request: CreateReferenceRequest): Promise<PrimeTrustData> {
    const { wallet_address } = await this.primeTrustService.createWallet(request);

    return this.koyweService.createReference(request, wallet_address);
  }
  makeWithdrawal(request: TransferMethodRequest): Promise<PrimeTrustData> {
    return this.primeTrustService.makeWithdrawal(request);
  }
}
