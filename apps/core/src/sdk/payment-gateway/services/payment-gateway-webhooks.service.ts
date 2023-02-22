import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountIdRequest } from '~common/grpc/interfaces/payment-gateway';
import { UserService } from '../../../user/services/user.service';
import { PaymentGatewayEntity } from '../entities/payment-gateway.entity';
import { PrimeTrustService } from './prime_trust/prime-trust.service';

@Injectable()
export class PaymentGatewayWebhooksService {
  constructor(
    private userService: UserService,

    private primeTrustService: PrimeTrustService,

    @InjectRepository(PaymentGatewayEntity)
    private readonly paymentGatewayEntityRepository: Repository<PaymentGatewayEntity>,
  ) {}

  async updateAccount(request: AccountIdRequest) {
    return this.primeTrustService.updateAccount(request.id);
  }

  async documentCheck(request: AccountIdRequest) {
    return this.primeTrustService.documentCheck(request);
  }

  async cipCheck(request: AccountIdRequest) {
    const { id, resource_id } = request;

    return this.primeTrustService.cipCheck(id, resource_id);
  }

  async updateBalance(request: AccountIdRequest) {
    return this.primeTrustService.updateAccountBalance(request.id);
  }

  async updateWithdraw(request: AccountIdRequest) {
    const { resource_id } = request;

    return this.primeTrustService.updateWithdraw(resource_id);
  }

  async updateContribution(request: AccountIdRequest) {
    return this.primeTrustService.updateContribution(request);
  }
}
