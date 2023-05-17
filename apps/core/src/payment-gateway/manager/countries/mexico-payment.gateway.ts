import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  CreateReferenceRequest,
  DepositRedirectData,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankInterface,
  BankWithdrawalInterface,
  CashDepositInterface,
  PaymentGatewayInterface,
  PaymentMethod,
} from '../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../services/koywe/koywe.service';
import { LiquidoService } from '../../services/liquido/liquido.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class MexicoPaymentGateway
  implements PaymentGatewayInterface, BankInterface, CashDepositInterface, BankWithdrawalInterface
{
  constructor(
    private primeTrustService: PrimeTrustService,
    private koyweService: KoyweService,
    private liquidoService: LiquidoService,
  ) {}

  getAvailablePaymentMethods(): PaymentMethod[] {
    return ['bank-transfer', 'cash'];
  }

  addBank(request: BankAccountParams): Promise<BankAccountParams> {
    return this.koyweService.addBankAccountParams(request);
  }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.koyweService.getBanksInfo(country);
  }

  async createRedirectReference(request: CreateReferenceRequest): Promise<DepositRedirectData> {
    const { type } = request;
    if (type === 'cash') {
      return this.liquidoService.createCashPayment(request);
    }
    if (type === 'wire') {
      const { wallet_address, asset_transfer_method_id } = await this.primeTrustService.createWallet(request);

      return this.koyweService.createReference(request, { wallet_address, asset_transfer_method_id, method: 'WIREMX' });
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    const { id, amount } = request;
    const wallet = await this.liquidoService.makeWithdrawal(request);

    return this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
