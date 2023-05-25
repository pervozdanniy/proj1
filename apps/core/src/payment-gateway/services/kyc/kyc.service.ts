import { Injectable, Logger } from '@nestjs/common';
import { DecisionWebhook, EventWebhook } from '~common/grpc/interfaces/veriff';
import { VeriffService } from '../../modules/veriff/services/veriff.service';
import { PaymentGatewayService } from '../payment-gateway.service';

@Injectable()
export class KYCService {
  private readonly logger = new Logger(KYCService.name);
  constructor(private readonly veriff: VeriffService, private readonly paymentGateway: PaymentGatewayService) {}

  generateVeriffLink(id: number) {
    return this.veriff.generateVeriffLink(id);
  }

  async eventHandler(request: EventWebhook) {
    try {
      await this.veriff.eventHandler(request);
      // if (success) {
      //   await this.verifyPaymentAccount(user_id);
      // }
    } catch (error) {
      this.logger.error('Event handler', error, request);
    }
  }

  async decisionHandler(request: DecisionWebhook) {
    try {
      const { success, user_id } = await this.veriff.decisionHandler(request);
      if (success) {
        await this.verifyPaymentAccount(user_id);
      }
    } catch (error) {
      this.logger.error('Decision handler', error, request);
    }
  }

  private async verifyPaymentAccount(userId: number) {
    await this.paymentGateway.createAccountIfNotCreated(userId);
    // const contact = await this.paymentGateway.getContact(userId);
    // if (!contact?.identity_confirmed) {
    //   await this.paymentGateway.verifyDocuments(userId, uuid);
    // }
  }
}
