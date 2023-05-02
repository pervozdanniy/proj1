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
import { LiquidoService } from '../../services/liquido/liquido.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class MexicoPaymentGateway
  implements PaymentGatewayInterface, BankInterface, WireDepositInterface, BankWithdrawalInterface
{
  constructor(
    private primeTrustService: PrimeTrustService,
    private koyweService: KoyweService,
    private payfuraService: PayfuraService,

    private liquidoService: LiquidoService,
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

    return this.payfuraService.createReference(request, wallet_address, asset_transfer_method_id);
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    const { id, amount } = request;
    const wallet = await this.liquidoService.makeWithdrawal(request);

    return await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
