import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { DepositFlowServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { TransferInfoDto } from '../utils/prime-trust-response.dto';

@Injectable()
export class DepositService implements OnModuleInit {
  private flowClient: DepositFlowServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.flowClient = this.client.getService('DepositFlowService');
  }

  async start(payload: { amount: string; currency: string; type: string }, userId: number) {
    const { flow_id, ...rest } = await firstValueFrom(
      this.flowClient.start({
        user_id: userId,
        amount: payload.amount,
        currency: payload.currency,
        type: payload.type,
      }),
    );

    return { flowId: flow_id, ...rest };
  }

  async payWithBank(
    payload: { flowId: number; bankId: number; transferType: string },
    userId: number,
  ): Promise<TransferInfoDto> {
    const info = await firstValueFrom(
      this.flowClient.payWithSelectedResource({
        id: payload.flowId,
        user_id: userId,
        bank: { id: payload.bankId, transfer_type: payload.transferType },
      }),
    );

    return {
      fee: info.fee,
      conversion: {
        amount: info.amount,
        currency: info.currency,
        rate: info.rate,
      },
    };
  }

  async payWithCard(
    payload: { flowId: number; cardId: number; cvv: string },
    userId: number,
  ): Promise<TransferInfoDto> {
    const info = await firstValueFrom(
      this.flowClient.payWithSelectedResource({
        id: payload.flowId,
        user_id: userId,
        card: { id: payload.cardId, cvv: payload.cvv },
      }),
    );

    return {
      fee: info.fee,
      conversion: {
        amount: info.amount,
        currency: info.currency,
        rate: info.rate,
      },
    };
  }
}
