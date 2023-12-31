import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  BankCredentialsData,
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
  WireDepositInterface,
} from '../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../services/koywe/koywe.service';
import { LiquidoService } from '../../services/liquido/liquido.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class MexicoPaymentGateway
  implements
    PaymentGatewayInterface,
    BankInterface,
    RedirectDepositInterface,
    BankWithdrawalInterface,
    WireDepositInterface
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
    return this.primeTrustService.addBankAccountParams(request);
  }

  getAvailableBanks(country: string): Promise<BanksInfoResponse> {
    return this.koyweService.getBanksInfo(country);
  }

  createRedirectReference(request: CreateReferenceRequest): Promise<DepositRedirectData> {
    return this.liquidoService.createCashPayment(request);
  }

  async createWireReference(request: CreateReferenceRequest): Promise<BankCredentialsData> {
    const { wallet_address, asset_transfer_method_id } = await this.primeTrustService.createWallet(request);

    return this.koyweService.createReference(request, { wallet_address, asset_transfer_method_id, method: 'WIREMX' });
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    return this.liquidoService.makeWithdrawal(request);
  }
}
