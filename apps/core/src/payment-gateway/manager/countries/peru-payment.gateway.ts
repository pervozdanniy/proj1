import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  CreateReferenceRequest,
  DepositRedirectData,
  JsonData,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankInterface,
  BankWithdrawalInterface,
  PaymentGatewayInterface,
  PaymentMethod,
  RedirectDepositInterface,
} from '../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../services/koywe/koywe.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class PeruPaymentGateway
  implements PaymentGatewayInterface, BankInterface, RedirectDepositInterface, BankWithdrawalInterface
{
  constructor(private primeTrustService: PrimeTrustService, private koyweService: KoyweService) {}

  getAvailablePaymentMethods(): PaymentMethod[] {
    return ['bank-transfer'];
  }

  addBank(request: BankAccountParams): Promise<BankAccountParams> {
    return this.koyweService.addBankAccountParams(request);
  }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.koyweService.getBanksInfo(country);
  }

  async createRedirectReference(request: CreateReferenceRequest): Promise<DepositRedirectData> {
    const { wallet_address, asset_transfer_method_id } = await this.primeTrustService.createWallet(request);
    const { type } = request;
    if (type === 'wire') {
      return this.koyweService.createReference(request, { wallet_address, asset_transfer_method_id });
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    const { id, amount } = request;
    const { wallet } = await this.koyweService.makeWithdrawal(request);

    return await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
