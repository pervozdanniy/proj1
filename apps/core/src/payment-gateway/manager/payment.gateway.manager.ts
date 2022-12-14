import { PrimeTrustService } from '~svc/core/src/payment-gateway/prime_trust/prime.trust.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentGatewayManager {
  public callApiGatewayService(type) {
    switch (type) {
      case 'prime_trust':
        return new PrimeTrustService(new HttpService());
    }
  }
}
