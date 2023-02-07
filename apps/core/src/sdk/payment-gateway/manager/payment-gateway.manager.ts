import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrimeTrustService } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/prime-trust.service';

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