import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  CreateReferenceRequest,
  JsonData,
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
  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }

  async createReference(request: CreateReferenceRequest): Promise<JsonData> {
    const { wallet_address, asset_transfer_method_id } = await this.primeTrustService.createWallet(request);

    return this.koyweService.createReference(request, wallet_address, asset_transfer_method_id);
  }
  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    return this.primeTrustService.makeWithdrawal(request);
  }
}
