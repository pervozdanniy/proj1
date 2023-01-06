import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AccountIdRequest, TransferMethodRequest, WithdrawalParams } from '~common/grpc/interfaces/payment-gateway';
import { PrimeAccountManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeKycManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeUserManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-user-manager';
import { PrimeWireManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-wire.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeTrustService {
  constructor(
    private readonly httpService: HttpService,

    private readonly primeTokenManager: PrimeTokenManager,

    private readonly primeUserManager: PrimeUserManager,

    private readonly primeAccountManager: PrimeAccountManager,

    private readonly primeKycManager: PrimeKycManager,

    private readonly primeWireManager: PrimeWireManager,
  ) {}

  createUser(user: UserEntity) {
    return this.primeUserManager.createUser(user);
  }

  getToken(userDetails: UserEntity) {
    return this.primeTokenManager.getToken(userDetails);
  }

  createAccount(userDetails: UserEntity, token) {
    return this.primeAccountManager.createAccount(userDetails, token);
  }

  updateAccount(id: string) {
    return this.primeAccountManager.updateAccount(id);
  }

  createContact(userDetails: UserEntity, token: string) {
    return this.primeKycManager.createContact(userDetails, token);
  }

  uploadDocument(userDetails: UserEntity, file: any, label: string, token: string) {
    return this.primeKycManager.uploadDocument(userDetails, file, label, token);
  }

  documentCheck(id: string) {
    return this.primeKycManager.documentCheck(id);
  }
  cipCheck(id: string, resource_id: string) {
    return this.primeKycManager.cipCheck(id, resource_id);
  }

  createReference(userDetails: UserEntity, token: string) {
    return this.primeWireManager.createReference(userDetails, token);
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
