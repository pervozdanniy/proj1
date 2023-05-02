import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  CreateReferenceRequest,
  JsonData,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankInterface,
  BankWithdrawalInterface,
  PaymentGatewayInterface,
  PaymentMethod,
  WireDepositInterface,
} from '../../interfaces/payment-gateway.interface';
import { PayfuraService } from '../../services/facilita/facilita.service';
import { KoyweService } from '../../services/koywe/koywe.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class PeruPaymentGateway
  implements PaymentGatewayInterface, BankInterface, WireDepositInterface, BankWithdrawalInterface
{
  constructor(
    private primeTrustService: PrimeTrustService,
    private koyweService: KoyweService,
    private payfuraService: PayfuraService,
  ) {}

  getAvailablePaymentMethods(): PaymentMethod[] {
    return ['bank-transfer'];
  }

  addBank(request: BankAccountParams): Promise<BankAccountParams> {
    return this.koyweService.addBankAccountParams(request);
  }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.koyweService.getBanksInfo(country);
  }

  async createReference(request: CreateReferenceRequest): Promise<JsonData> {
    const { wallet_address, asset_transfer_method_id } = await this.primeTrustService.createWallet(request);
    const { type } = request;
    if (type === 'wire') {
      return this.koyweService.createReference(request, { wallet_address, asset_transfer_method_id });
    }
    if (type === 'cash' || type === 'credit_card') {
      return this.payfuraService.createReference(request, wallet_address, asset_transfer_method_id);
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    const { id, amount } = request;
    const wallet = await this.koyweService.makeWithdrawal(request);

    return await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
