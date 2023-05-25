import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { KoyweWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { TransfersEntity, TransferStatus } from '~svc/core/src/payment-gateway/entities/transfers.entity';
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
    const currentTransfer = await this.transfersEntityRepository.findOneBy({ uuid: orderId });
    if (currentTransfer) {
      await this.koyweTokenManager.getCommonToken();
      const { status } = await this.koyweMainManager.getOrderInfo(orderId);
      let currentStatus = TransferStatus.PENDING;
      if (status === 'DELIVERED') {
        currentStatus = TransferStatus.DELIVERED;
      }
      if (status === 'REJECTED') {
        currentStatus = TransferStatus.FAILED;
      }
      await this.transfersEntityRepository.update({ uuid: orderId }, { status: currentStatus });

      return { success: true };
    }
  }
}
