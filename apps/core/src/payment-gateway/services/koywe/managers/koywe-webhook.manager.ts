import { TransfersEntity } from '@/payment-gateway/entities/main/transfers.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { KoyweWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { KoyweMainManager } from './koywe-main.manager';
import { KoyweTokenManager } from './koywe-token.manager';

@Injectable()
export class KoyweWebhookManager {
  constructor(
    private readonly koyweTokenManager: KoyweTokenManager,
    private readonly koyweMainManager: KoyweMainManager,

    @InjectRepository(TransfersEntity)
    private readonly transfersEntityRepository: Repository<TransfersEntity>,
  ) {}

  async koyweWebhooksHandler(request: KoyweWebhookRequest): Promise<SuccessResponse> {
    const { orderId } = request;
    await this.koyweTokenManager.getCommonToken();
    const { status } = await this.koyweMainManager.getOrderInfo(orderId);
    await this.transfersEntityRepository.update({ uuid: orderId }, { status: status.toLowerCase() });

    return { success: true };
  }
}
