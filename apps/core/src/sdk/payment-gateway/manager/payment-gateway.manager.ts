import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ChilePaymentGateway } from './countries/chile-payment.gateway';
import { USPaymentGateway } from './countries/us-payment.gateway';

@Injectable()
export class PaymentGatewayManager {
  constructor(private moduleRef: ModuleRef) {}
  public async createApiGatewayService(type: string) {
    switch (type) {
      case 'US':
        return this.moduleRef.get(USPaymentGateway);
      case 'CL':
      case 'MX':
      case 'CO':
      case 'PE':
        return this.moduleRef.get(ChilePaymentGateway);
    }
  }
}
