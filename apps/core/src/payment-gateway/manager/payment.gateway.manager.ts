import { PrimeTrustService } from '~svc/core/src/payment-gateway/prime_trust/prime.trust.service';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PaymentGatewayManager {
  constructor(private moduleRef: ModuleRef) {}
  public async createApiGatewayService(type: string) {
    switch (type) {
      case 'prime_trust':
        return this.moduleRef.get(PrimeTrustService);
    }
  }
}
