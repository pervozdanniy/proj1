import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { WithdrawFlowServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { DepositStartResponseDto } from '../dtos/deposit/flow.dto';
import { TransferInfoDto } from '../utils/prime-trust-response.dto';

@Injectable()
export class WithdrawService implements OnModuleInit {
  private flowClient: WithdrawFlowServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.flowClient = this.client.getService('WithdrawFlowService');
  }

  async start(payload: { amount: number; currency: string; type: string }, userId: number) {}
  payWithBank(payload: { flowId: number; customerId?: string; transferType: string }, userId: number) {
    return firstValueFrom(
      this.flowClient.payWithSelectedResource({
        id: payload.flowId,
        user_id: userId,
        // bank: { id: payload.bankId, transfer_type: payload.transferType },
        customer: { id: payload.customerId },
      }),
    );
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
