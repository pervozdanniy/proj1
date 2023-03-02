import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  CreateReferenceRequest,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { KoyweBankAccountManager } from './managers/koywe-bank-account.manager';
import { KoyweDepositManager } from './managers/koywe-deposit.manager';
import { KoyweWithdrawalManager } from './managers/koywe-withdrawal.manager';

@Injectable()
export class KoyweService {
  constructor(
    private readonly koyweDepositManager: KoyweDepositManager,
    private readonly koyweBankAccountManager: KoyweBankAccountManager,
    private readonly koyweWithdrawalManager: KoyweWithdrawalManager,
  ) {}

  createReference(request: CreateReferenceRequest, wallet_address: string, asset_transfer_method_id: string) {
    return this.koyweDepositManager.createReference(request, wallet_address, asset_transfer_method_id);
  }

  getBanksInfo(code: string) {
    return this.koyweBankAccountManager.getBanksInfo(code);
  }

  addBankAccountParams(request: BankAccountParams) {
    return this.koyweBankAccountManager.addBankAccountParams(request);
  }

  makeWithdrawal(request: TransferMethodRequest) {
    return this.koyweWithdrawalManager.makeWithdrawal(request);
  }
}
