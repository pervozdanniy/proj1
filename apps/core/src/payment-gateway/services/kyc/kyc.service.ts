import { Injectable } from '@nestjs/common';
import { DecisionWebhook, EventWebhook } from '~common/grpc/interfaces/veriff';
import { VeriffService } from '../../modules/veriff/services/veriff.service';
import { PaymentGatewayService } from '../payment-gateway.service';

@Injectable()
export class KYCService {
  constructor(private readonly veriff: VeriffService, private readonly paymentGateway: PaymentGatewayService) {}

  generateVeriffLink(id: number) {
    return this.veriff.generateVeriffLink(id);
  }

  eventHandler(request: EventWebhook) {
    return this.veriff.veriffHookHandler(request);
  }

  async decisionHandler(request: DecisionWebhook) {
    const { success, user_id } = await this.veriff.decisionHandler(request);
    if (success) {
      await this.paymentGateway.createAccount(user_id);
    }
  }
}
