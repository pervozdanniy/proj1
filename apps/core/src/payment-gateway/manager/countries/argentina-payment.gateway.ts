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
import { KoyweService } from '../../services/koywe/koywe.service';
import { PayfuraService } from '../../services/payfura/payfura.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class ArgentinaPaymentGateway
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
    if (type === 'credit_card') {
      return this.payfuraService.createReference(request, wallet_address, asset_transfer_method_id);
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    const { id, amount } = request;
    //must be Decrypto withdrawal logic
    const wallet = 'wallet address from Decrypto';

    return await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
