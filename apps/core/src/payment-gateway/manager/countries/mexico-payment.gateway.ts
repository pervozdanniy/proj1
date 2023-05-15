import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BanksInfoResponse,
  ContributionResponse,
  MakeDepositRequest,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankInterface,
  BankWithdrawalInterface,
  DepositInterface,
  PaymentGatewayInterface,
  PaymentMethod,
} from '../../interfaces/payment-gateway.interface';
import { FacilitaService } from '../../services/facilita/facilita.service';
import { KoyweService } from '../../services/koywe/koywe.service';
import { LiquidoService } from '../../services/liquido/liquido.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class MexicoPaymentGateway
  implements PaymentGatewayInterface, BankInterface, DepositInterface, BankWithdrawalInterface
{
  constructor(
    private primeTrustService: PrimeTrustService,
    private koyweService: KoyweService,
    private facilitaService: FacilitaService,

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

  makeDeposit(request: MakeDepositRequest): Promise<ContributionResponse> {
    return this.facilitaService.makeDeposit(request);
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    const { id, amount } = request;
    const wallet = await this.liquidoService.makeWithdrawal(request);

    return this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
