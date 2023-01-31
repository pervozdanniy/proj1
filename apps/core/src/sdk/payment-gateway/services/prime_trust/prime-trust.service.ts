import { Injectable } from '@nestjs/common';
import { AccountIdRequest, TransferMethodRequest, WithdrawalParams } from '~common/grpc/interfaces/payment-gateway';
import { UserEntity } from '~svc/core/src/api/user/entities/user.entity';
import { PrimeAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeKycManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeWireManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-wire.manager';

@Injectable()
export class PrimeTrustService {
  prime_token: string;
  constructor(
    private readonly primeTokenManager: PrimeTokenManager,
    private readonly primeAccountManager: PrimeAccountManager,
    private readonly primeKycManager: PrimeKycManager,
    private readonly primeWireManager: PrimeWireManager,
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

  documentCheck(id: string) {
    return this.primeKycManager.documentCheck(id);
  }
  cipCheck(id: string, resource_id: string) {
    return this.primeKycManager.cipCheck(id, resource_id);
  }

  createReference(userDetails: UserEntity) {
    return this.primeWireManager.createReference(userDetails);
  }

  async updateAccountBalance(id: string) {
    return this.primeWireManager.updateAccountBalance(id);
  }

  async getBalance(id: number) {
    return this.primeWireManager.getAccountBalance(id);
  }

  addWithdrawalParams(request: WithdrawalParams) {
    return this.primeWireManager.addWithdrawalParams(request);
  }

  makeWithdrawal(request: TransferMethodRequest) {
    return this.primeWireManager.makeWithdrawal(request);
  }

  updateWithdraw(resource_id: string) {
    return this.primeWireManager.updateWithdraw(resource_id);
  }

  updateContribution(request: AccountIdRequest) {
    return this.primeWireManager.updateContribution(request);
  }
}
