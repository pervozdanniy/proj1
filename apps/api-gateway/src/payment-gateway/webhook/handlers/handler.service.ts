import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';

@Injectable()
export class HandlerService {
  async handler(payload, client: PaymentGatewayServiceClient) {
    const { resource_type, action } = payload;
    const id: string = payload['account-id'];
    if (resource_type === 'accounts' && action === 'update') {
      return lastValueFrom(client.updateAccount({ id, status: 'opened', payment_gateway: 'prime_trust' }));
    } else if (resource_type === 'kyc_document_checks' && action === 'update') {
      return lastValueFrom(client.documentCheck({ id, payment_gateway: 'prime_trust' }));
    }
  }
}
