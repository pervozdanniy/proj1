import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  DepositRedirectData,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankInterface,
  BankWithdrawalInterface,
  CreateReferenceRequest,
  PaymentGatewayInterface,
  PaymentMethod,
  RedirectDepositInterface,
} from '../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../services/koywe/koywe.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class ColombiaPaymentGateway
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

    return this.koyweService.createRedirectReference(request, {
      wallet_address,
      asset_transfer_method_id,
      method: 'PALOMMA',
    });
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    const { id, amount } = request;
    const { wallet, info } = await this.koyweService.makeWithdrawal(request);
    await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });

    return info;
  }
}
