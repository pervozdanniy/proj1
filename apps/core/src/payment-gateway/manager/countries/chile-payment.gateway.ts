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
import { LiquidoService } from '../../services/liquido/liquido.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class ChilePaymentGateway
  implements PaymentGatewayInterface, BankInterface, RedirectDepositInterface, BankWithdrawalInterface
{
  constructor(
    private primeTrustService: PrimeTrustService,
    private koyweService: KoyweService,
    private liquidoService: LiquidoService,
  ) {}

  getAvailablePaymentMethods(): PaymentMethod[] {
    return ['bank-transfer'];
  }

  async createRedirectReference(request: CreateReferenceRequest): Promise<DepositRedirectData> {
    const { wallet_address } = await this.primeTrustService.createWallet(request);

    return this.koyweService.createRedirectReference(request, {
      wallet_address,
      method: 'KHIPU',
    });
  }

  addBank(request: BankAccountParams): Promise<BankAccountParams> {
    return this.koyweService.addBankAccountParams(request);
  }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.koyweService.getBanksInfo(country);
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    const { id, amount, funds_transfer_type } = request;
    if (funds_transfer_type === 'wire') {
      const { wallet, info } = await this.koyweService.makeWithdrawal(request);

      await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });

      return info;
    }
    if (funds_transfer_type === 'cash') {
      return this.liquidoService.makeWithdrawal(request);
    }
  }
}
