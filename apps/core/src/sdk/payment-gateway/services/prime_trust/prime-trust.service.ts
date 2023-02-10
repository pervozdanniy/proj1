import { Injectable } from '@nestjs/common';
import {
  AccountIdRequest,
  BankAccountParams,
  DepositParams,
  MakeContributionRequest,
  TransferFundsRequest,
  TransferMethodRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { PrimeAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeBankAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { PrimeKycManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeTransactionsManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-transactions.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeTrustService {
  constructor(
    private readonly primeTokenManager: PrimeTokenManager,
    private readonly primeAccountManager: PrimeAccountManager,
    private readonly primeKycManager: PrimeKycManager,
    private readonly primeTransactionsManager: PrimeTransactionsManager,

    private readonly primeBankAccountManager: PrimeBankAccountManager,
  ) {}

  getToken() {
    return this.primeTokenManager.getToken();
  }

  createAccount(userDetails: UserEntity) {
    return this.primeAccountManager.createAccount(userDetails);
  }

  updateAccount(id: string) {
    return this.primeAccountManager.updateAccount(id);
  }

  createContact(userDetails: UserEntity) {
    return this.primeKycManager.createContact(userDetails);
  }

  uploadDocument(userDetails: UserEntity, file: any, label: string) {
    return this.primeKycManager.uploadDocument(userDetails, file, label);
  }

  documentCheck(request: AccountIdRequest) {
    return this.primeKycManager.documentCheck(request);
  }
  cipCheck(id: string, resource_id: string) {
    return this.primeKycManager.cipCheck(id, resource_id);
  }

  createReference(userDetails: UserEntity) {
    return this.primeTransactionsManager.createReference(userDetails);
  }

  async updateAccountBalance(id: string) {
    return this.primeTransactionsManager.updateAccountBalance(id);
  }

  async getBalance(id: number) {
    return this.primeTransactionsManager.getAccountBalance(id);
  }

  addWithdrawalParams(request: WithdrawalParams) {
    return this.primeTransactionsManager.addWithdrawalParams(request);
  }

  makeWithdrawal(request: TransferMethodRequest) {
    return this.primeTransactionsManager.makeWithdrawal(request);
  }

  updateWithdraw(resource_id: string) {
    return this.primeTransactionsManager.updateWithdraw(resource_id);
  }

  updateContribution(request: AccountIdRequest) {
    return this.primeTransactionsManager.updateContribution(request);
  }

  getWithdrawalParams(id: number) {
    return this.primeTransactionsManager.getWithdrawalParams(id);
  }

  createCreditCardResource(id: number) {
    return this.primeTransactionsManager.createCreditCardResource(id);
  }

  verifyCreditCard(resource_id: string) {
    return this.primeTransactionsManager.verifyCreditCard(resource_id);
  }

  getCreditCards(id: number) {
    return this.primeTransactionsManager.getCreditCards(id);
  }

  transferFunds(request: TransferFundsRequest) {
    return this.primeTransactionsManager.transferFunds(request);
  }

  addBankAccountParams(request: BankAccountParams) {
    return this.primeBankAccountManager.addBankAccountParams(request);
  }

  getBankAccounts(id: number) {
    return this.primeBankAccountManager.getBankAccounts(id);
  }

  makeContribution(request: MakeContributionRequest) {
    return this.primeTransactionsManager.makeContribution(request);
  }

  getAccount(id: number) {
    return this.primeAccountManager.getAccount(id);
  }

  getContact(id: number) {
    return this.primeKycManager.getContact(id);
  }
  addDepositParams(request: DepositParams) {
    return this.primeTransactionsManager.addDepositParams(request);
  }

  getTransfers(id: number) {
    return this.primeTransactionsManager.getTransfers(id);
  }
}
