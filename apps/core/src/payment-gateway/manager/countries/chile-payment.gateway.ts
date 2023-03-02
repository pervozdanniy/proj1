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
  PaymentGatewayInterface,
  PaymentMethods,
  WireDepositInterface,
  WithdrawalInterface,
} from '../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../services/koywe/koywe.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

@Injectable()
export class ChilePaymentGateway
  implements PaymentGatewayInterface, BankInterface, WireDepositInterface, WithdrawalInterface
{
  private primeTrustService: PrimeTrustService;
  private koyweService: KoyweService;

  constructor(primeTrustService: PrimeTrustService, koyweService: KoyweService) {
    this.primeTrustService = primeTrustService;
    this.koyweService = koyweService;
  }

  getAvailablePaymentMethods(): PaymentMethods[] {
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

    return this.koyweService.createReference(request, wallet_address, asset_transfer_method_id);
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    const { id, amount } = request;
    const wallet = await this.koyweService.makeWithdrawal(request);
    return await this.primeTrustService.makeAssetWithdrawal({ id, amount, wallet });
  }
}
