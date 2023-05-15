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

  async createReference(request: CreateReferenceRequest): Promise<JsonData> {
    const { type } = request;
    if (type === 'cash') {
      return this.liquidoService.createCashPayment(request);
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    const { id, amount } = request;
    const wallet = await this.liquidoService.makeWithdrawal(request);

    return await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
