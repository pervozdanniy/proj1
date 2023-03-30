import { Injectable } from '@nestjs/common';
import { CreateReferenceRequest } from '~common/grpc/interfaces/payment-gateway';
import { PayfuraDepositManager } from './managers/payfura-deposit.manager';

@Injectable()
export class PayfuraService {
  constructor(private readonly payfuraDepositManager: PayfuraDepositManager) {}

  createReference(request: CreateReferenceRequest, wallet_address: string, asset_transfer_method_id: string) {
    return this.payfuraDepositManager.createReference(request, wallet_address, asset_transfer_method_id);
  }
}
