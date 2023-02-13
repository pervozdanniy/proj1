import { PrimeBalanceManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-balance.manager';
import { PrimeDepositManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-deposit.manager';
import { PrimeFundsTransferManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-funds-transfer.manager';
import { PrimeTransactionsManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-transactions.manager';
import { PrimeWithdrawalManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-withdrawal.manager';
import { Injectable } from '@nestjs/common';
import {
  AccountIdRequest,
  BankAccountParams,
  DepositParams,
  MakeContributionRequest,
  TransferFundsRequest,
  TransferMethodRequest,
  UserIdRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { PrimeAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeBankAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { PrimeKycManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeTrustService {
  constructor(
    private readonly primeTokenManager: PrimeTokenManager,
    private readonly primeAccountManager: PrimeAccountManager,
    private readonly primeKycManager: PrimeKycManager,
    private readonly primeBalanceManager: PrimeBalanceManager,

    private readonly primeDepositManager: PrimeDepositManager,

    private readonly primeFundsTransferManager: PrimeFundsTransferManager,

    private readonly primeWithdrawalManager: PrimeWithdrawalManager,

    private readonly primeBankAccountManager: PrimeBankAccountManager,

    private readonly primeTransactionsManager: PrimeTransactionsManager,
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
    return this.primeDepositManager.createReference(userDetails);
  }

  async updateAccountBalance(id: string) {
    return this.primeBalanceManager.updateAccountBalance(id);
  }

  async getBalance(id: number) {
    return this.primeBalanceManager.getAccountBalance(id);
  }

  addWithdrawalParams(request: WithdrawalParams) {
    return this.primeWithdrawalManager.addWithdrawalParams(request);
  }

  makeWithdrawal(request: TransferMethodRequest) {
    return this.primeWithdrawalManager.makeWithdrawal(request);
  }

  updateWithdraw(resource_id: string) {
    return this.primeWithdrawalManager.updateWithdraw(resource_id);
  }

  updateContribution(request: AccountIdRequest) {
    return this.primeDepositManager.updateContribution(request);
  }

  getWithdrawalParams(id: number) {
    return this.primeWithdrawalManager.getWithdrawalParams(id);
  }

  createCreditCardResource(id: number) {
    return this.primeDepositManager.createCreditCardResource(id);
  }

  verifyCreditCard(resource_id: string) {
    return this.primeDepositManager.verifyCreditCard(resource_id);
  }

  getCreditCards(id: number) {
    return this.primeDepositManager.getCreditCards(id);
  }

  transferFunds(request: TransferFundsRequest) {
    return this.primeFundsTransferManager.transferFunds(request);
  }

  addBankAccountParams(request: BankAccountParams) {
    return this.primeBankAccountManager.addBankAccountParams(request);
  }

  getBankAccounts(id: number) {
    return this.primeBankAccountManager.getBankAccounts(id);
  }

  makeContribution(request: MakeContributionRequest) {
    return this.primeDepositManager.makeContribution(request);
  }

  getAccount(id: number) {
    return this.primeAccountManager.getAccount(id);
  }

  getContact(id: number) {
    return this.primeKycManager.getContact(id);
  }
  addDepositParams(request: DepositParams) {
    return this.primeDepositManager.addDepositParams(request);
  }

  getTransferById(request: UserIdRequest) {
    return this.primeFundsTransferManager.getTransferById(request);
  }

  getTransactions(id: number) {
    return this.primeTransactionsManager.getTransactions(id);
  }

  getDepositById(request: UserIdRequest) {
    return this.primeDepositManager.getDepositById(request);
  }
}
