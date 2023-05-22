import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { DepositFlowServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { DepositStartResponseDto } from '../dtos/deposit/flow.dto';
import { TransferInfoDto } from '../utils/prime-trust-response.dto';

@Injectable()
export class DepositService implements OnModuleInit {
  private flowClient: DepositFlowServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.flowClient = this.client.getService('DepositFlowService');
  }

  async start(payload: { amount: number; currency: string; type: string }, userId: number) {
    const { flow_id, action, redirect, bank_params, ...rest } = await firstValueFrom(
      this.flowClient.start({
        user_id: userId,
        amount: payload.amount,
        currency: payload.currency,
        type: payload.type,
      }),
    );
    const response: DepositStartResponseDto = { flowId: flow_id, action, ...rest };
    if (redirect) {
      response.redirect = {
        url: redirect.url,
        info: {
          fee: redirect.info.fee,
          conversion: {
            amount: redirect.info.amount,
            currency: redirect.info.currency,
            rate: redirect.info.rate,
          },
        },
      };
    }

    if (bank_params) {
      response.bank_params = {
        bank: bank_params.bank,
        info: {
          fee: bank_params.info.fee,
          conversion: {
            amount: bank_params.info.amount,
            currency: bank_params.info.currency,
            rate: bank_params.info.rate,
          },
        },
      };
    }

    return response;
  }
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
