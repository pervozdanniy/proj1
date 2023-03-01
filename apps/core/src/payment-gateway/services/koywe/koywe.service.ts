import { Injectable } from '@nestjs/common';
import { BankAccountParams, CreateReferenceRequest } from '~common/grpc/interfaces/payment-gateway';
import { KoyweBankAccountManager } from './managers/koywe-bank-account.manager';
import { KoyweDepositManager } from './managers/koywe-deposit.manager';

@Injectable()
export class KoyweService {
  constructor(
    private readonly koyweDepositManager: KoyweDepositManager,
    private readonly koyweBankAccountManager: KoyweBankAccountManager,
  ) {}

  createReference(request: CreateReferenceRequest, wallet_address: string, asset_transfer_method_id: string) {
    return this.koyweDepositManager.createReference(request, wallet_address, asset_transfer_method_id);
  }

  getBanksInfo(code: string, email: string) {
    return this.koyweBankAccountManager.getBanksInfo(code, email);
  }

  addBankAccountParams(request: BankAccountParams) {
    return this.koyweBankAccountManager.addBankAccountParams(request);
  }
}
