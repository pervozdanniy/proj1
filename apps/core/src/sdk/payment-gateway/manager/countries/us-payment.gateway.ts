import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  CreateReferenceRequest,
  JsonData,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { PaymentGatewayInterface } from '../../interfaces/payment-gateway.interface';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class USPaymentGateway implements PaymentGatewayInterface {
  private primeTrustService: PrimeTrustService;
  constructor(primeTrustService: PrimeTrustService) {
    this.primeTrustService = primeTrustService;
  }

  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }
  createReference(request: CreateReferenceRequest): Promise<JsonData> {
    return this.primeTrustService.createReference(request);
  }
  makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    return this.primeTrustService.makeWithdrawal(request);
  }
}
