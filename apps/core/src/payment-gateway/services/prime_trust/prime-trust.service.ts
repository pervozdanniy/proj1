import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { IdRequest } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  AgreementRequest,
  AssetWithdrawalRequest,
  BankAccountParams,
  DepositParamRequest,
  SearchTransactionRequest,
  TransferFundsRequest,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { CreateReferenceRequest, MakeDepositRequest } from '../../interfaces/payment-gateway.interface';
import { PrimeAccountManager } from './managers/prime-account.manager';
import { PrimeAssetsManager } from './managers/prime-assets.manager';
import { PrimeBalanceManager } from './managers/prime-balance.manager';
import { PrimeBankAccountManager } from './managers/prime-bank-account.manager';
import { PrimeDepositManager } from './managers/prime-deposit.manager';
import { PrimeFundsTransferManager } from './managers/prime-funds-transfer.manager';
import { PrimeKycManager } from './managers/prime-kyc-manager';
import { PrimeTokenManager } from './managers/prime-token.manager';
import { PrimeTransactionsManager } from './managers/prime-transactions.manager';
import { PrimeWithdrawalManager } from './managers/prime-withdrawal.manager';

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

    private readonly primeAssetsManager: PrimeAssetsManager,
  ) {}

  getToken() {
    return this.primeTokenManager.getToken();
  }

  createAccountIfNotCreated(userDetails: UserEntity) {
    return this.primeAccountManager.createAccountIfNotCreated(userDetails);
  }

  updateAccount({ id }: AccountIdRequest) {
    return this.primeAccountManager.updateAccount(id);
  }

  updateContact(request: AccountIdRequest) {
    return this.primeKycManager.updateContact(request);
  }

  createContact(userDetails: UserEntity) {
    return this.primeKycManager.createContact(userDetails);
  }

  documentCheck(request: AccountIdRequest) {
    return this.primeKycManager.documentCheck(request);
  }

  cipCheck({ id, resource_id }: AccountIdRequest) {
    return this.primeKycManager.cipCheck(id, resource_id);
  }

  async updateBalance({ id }: AccountIdRequest) {
    return this.primeBalanceManager.updateAccountBalance(id);
  }

  async getBalance(id: number) {
    return this.primeBalanceManager.getAccountBalance(id);
  }

  makeWithdrawal(request: TransferMethodRequest) {
    return this.primeWithdrawalManager.makeWithdrawal(request);
  }

  updateWithdraw(request: AccountIdRequest) {
    return this.primeWithdrawalManager.updateWithdraw(request);
  }

  updateContribution(request: AccountIdRequest) {
    return this.primeDepositManager.updateContribution(request);
  }

  createCreditCardResource(userId: number) {
    return this.primeDepositManager.createCreditCardResource(userId);
  }

  verifyCreditCard(resource_id: string, transfer_method_id: string) {
    return this.primeDepositManager.verifyCreditCard(resource_id, transfer_method_id);
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

  getBankAccounts(id: number, country: string) {
    return this.primeBankAccountManager.getBankAccounts(id, country);
  }

  makeDeposit(request: MakeDepositRequest) {
    return this.primeDepositManager.makeDeposit(request);
  }

  getAccount(id: number) {
    return this.primeAccountManager.getAccount(id);
  }

  getContact(userId: number) {
    return this.primeKycManager.getContact(userId);
  }

  addDepositParams(request: DepositParamRequest) {
    return this.primeDepositManager.addDepositParams(request);
  }

  getTransactions(request: SearchTransactionRequest) {
    return this.primeTransactionsManager.getTransactions(request);
  }

  getDepositParams(id: number) {
    return this.primeDepositManager.getDepositParams(id);
  }

  createWallet(depositParams: CreateReferenceRequest) {
    return this.primeAssetsManager.createWallet(depositParams);
  }

  updateAssetDeposit(request: AccountIdRequest) {
    return this.primeAssetsManager.updateAssetDeposit(request);
  }

  getBanksInfo(country: string) {
    return this.primeBankAccountManager.getBanksInfo(country);
  }

  makeAssetWithdrawal(request: AssetWithdrawalRequest) {
    return this.primeAssetsManager.makeAssetWithdrawal(request);
  }

  createAgreement(request: AgreementRequest) {
    return this.primeAccountManager.createAgreement(request);
  }

  getUserAccountStatus(request: IdRequest) {
    return this.primeAccountManager.getUserAccountStatus(request);
  }

  transferToHotWallet() {
    return this.primeAccountManager.transferToHotWallet();
  }

  contingentHolds(request: AccountIdRequest) {
    return this.primeBalanceManager.contingentHolds(request);
  }

  updateFundsTransfer(request: AccountIdRequest) {
    return this.primeFundsTransferManager.updateFundsTransfer(request);
  }

  verifyDocuments(userId: number, accountId: string) {
    return this.primeKycManager.verifyDocuments(userId, accountId);
  }
}
