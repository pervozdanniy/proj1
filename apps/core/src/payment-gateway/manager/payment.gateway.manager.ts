import { PrimeTrustService } from '~svc/core/src/payment-gateway/prime_trust/prime.trust.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Queue } from 'bull';

@Injectable()
export class PaymentGatewayManager {
  public callApiGatewayService(type: string, primeUserRepository: Repository<any>, failedRequestsQueue: Queue = null) {
    switch (type) {
      case 'prime_trust':
        return new PrimeTrustService(new HttpService(), primeUserRepository, failedRequestsQueue);
    }
  }
}
