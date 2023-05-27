import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BankCredentialsData,
  BanksInfoResponse,
  TransferInfo,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import {
  BankInterface,
  BankWithdrawalInterface,
  CreateReferenceRequest,
  PaymentGatewayInterface,
  PaymentMethod,
  WireDepositInterface,
} from '../../interfaces/payment-gateway.interface';
import { FacilitaService } from '../../services/facilita/facilita.service';
import { KoyweService } from '../../services/koywe/koywe.service';
import { LiquidoService } from '../../services/liquido/liquido.service';

@Injectable()
export class BrazilPaymentGateway
  implements PaymentGatewayInterface, BankInterface, WireDepositInterface, BankWithdrawalInterface
{
  constructor(
    private koyweService: KoyweService,
    private facilitaService: FacilitaService,
    private liquidoService: LiquidoService,
  ) {}

  getAvailablePaymentMethods(): PaymentMethod[] {
    return ['bank-transfer'];
  }

  createWireReference(request: CreateReferenceRequest): Promise<BankCredentialsData> {
    return this.facilitaService.createWireReference(request);
  }

  addBank(request: BankAccountParams): Promise<BankAccountParams> {
    return this.koyweService.addBankAccountParams(request);
  }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.koyweService.getBanksInfo(country);
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    return this.liquidoService.makeWithdrawal(request);
  }
}
