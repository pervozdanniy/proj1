import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { KoyweService } from '../services/koywe/koywe.service';
import { PrimeTrustService } from '../services/prime_trust/prime-trust.service';
import { ChilePaymentGateway } from './countries/chile-payment.gateway';
import { USPaymentGateway } from './countries/us-payment.gateway';

@Injectable()
export class PaymentGatewayManager {
  constructor(private moduleRef: ModuleRef) {}
  public async createApiGatewayService(type: string) {
    switch (type) {
      case 'US':
        return new USPaymentGateway(this.moduleRef.get(PrimeTrustService));
      case 'CL':
      case 'MX':
      case 'CO':
      case 'PE':
        return new ChilePaymentGateway(this.moduleRef.get(PrimeTrustService), this.moduleRef.get(KoyweService));
    }
  }
}
