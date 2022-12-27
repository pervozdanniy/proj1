import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { PrimeAccountManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeKycManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeUserManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-user-manager';
import { PrimeWireManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-wire.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeTrustService {
  private readonly logger = new Logger(PrimeTrustService.name);
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

  updateAccount(id: string, status: string) {
    return this.primeAccountManager.updateAccount(id, status);
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

  createReference(userDetails: UserEntity, token: string) {
    return this.primeWireManager.createReference(userDetails, token);
  }

  async updateAccountBalance(id: string) {
    return this.primeWireManager.updateAccountBalance(id);
  }
}
