import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
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

    @Inject(PrimeTokenManager)
    private readonly primeTokenManager: PrimeTokenManager,

    @Inject(PrimeUserManager)
    private readonly primeUserManager: PrimeUserManager,

    @Inject(PrimeAccountManager)
    private readonly primeAccountManager: PrimeAccountManager,

    @Inject(PrimeKycManager)
    private readonly primeKycManager: PrimeKycManager,

    @Inject(PrimeWireManager)
    private readonly primeWireManager: PrimeWireManager,
  ) {}

  createUser(user) {
    return this.primeUserManager.createUser(user);
  }

  getToken(userDetails) {
    return this.primeTokenManager.getToken(userDetails);
  }

  createAccount(userDetails, token) {
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
