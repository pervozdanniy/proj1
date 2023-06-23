import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { TransferInfo, WithdrawFlowResponse, WithdrawFlowServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { StartWithdrawFlowDto } from '../dtos/withdrawal/flow.dto';

@Injectable()
export class WithdrawService implements OnModuleInit {
  private flowClient: WithdrawFlowServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.flowClient = this.client.getService('WithdrawFlowService');
  }

  async start(payload: StartWithdrawFlowDto, userId: number): Promise<WithdrawFlowResponse> {
    return firstValueFrom(
      this.flowClient.start({
        user_id: userId,
        amount: payload.amount,
        currency: payload.currency,
        type: payload.type,
      }),
    );
  }

  payWithBank(
    payload: { flowId: number; bankId: number; transferType: string },
    userId: number,
  ): Promise<TransferInfo> {
    return firstValueFrom(
      this.flowClient.payWithSelectedResource({
        id: payload.flowId,
        user_id: userId,
        bank: { id: payload.bankId, transfer_type: payload.transferType },
      }),
    );
  }
}
