import { PrimeTrustService } from '~svc/core/src/payment-gateway/prime_trust/prime.trust.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentGatewayManager {
  public callApiGatewayService(type, primeUserRepository) {
    switch (type) {
      case 'prime_trust':
        return new PrimeTrustService(new HttpService(), primeUserRepository);
    }
  }
}
