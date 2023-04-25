import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { DepositFlowServiceClient } from '~common/grpc/interfaces/payment-gateway';

@Injectable()
export class DepositService implements OnModuleInit {
  private flowClient: DepositFlowServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.flowClient = this.client.getService('DepositFlowService');
  }

  async start(payload: { amount: string; currency: string }, userId: number) {
    const { id, ...rest } = await firstValueFrom(
      this.flowClient.start({ user_id: userId, amount: payload.amount, currency: payload.currency }),
    );

    return { flowId: id, ...rest };
  }

  payWithBank(payload: { flowId: number; bankId: number; transferType: string }, userId: number) {
    return firstValueFrom(
      this.flowClient.payWithBank({
        id: payload.flowId,
        user_id: userId,
        select: { bank_id: payload.bankId, transfer_type: payload.transferType },
      }),
    );
  }
}
