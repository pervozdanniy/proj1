import { NotificationService } from '@/notification/services/notification.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { KoyweWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { KoyweMainManager } from './koywe-main.manager';
import { KoyweTokenManager } from './koywe-token.manager';

@Injectable()
export class KoyweWebhookManager {
  constructor(
    private readonly koyweTokenManager: KoyweTokenManager,
    private readonly koyweMainManager: KoyweMainManager,

    private readonly notificationService: NotificationService,

    @InjectRepository(TransfersEntity)
    private readonly transfersEntityRepository: Repository<TransfersEntity>,
  ) {}

  async koyweWebhooksHandler(request: KoyweWebhookRequest): Promise<SuccessResponse> {
    const { orderId } = request;
    const currentTransfer = await this.transfersEntityRepository.findOneBy({ uuid: orderId });
    if (currentTransfer) {
      await this.koyweTokenManager.getCommonToken();
      const { status } = await this.koyweMainManager.getOrderInfo(orderId);
      await this.transfersEntityRepository.update({ uuid: orderId }, { status: status.toLowerCase() });
      const {
        amount,
        currency_type,
        status: transferStatus,
        type,
        user_id,
      } = await this.transfersEntityRepository.findOneBy({ uuid: orderId });
      const notificationPayload = {
        user_id: user_id,
        title: 'Transfer',
        type: type,
        description: `Your transfer status for ${amount} ${currency_type} ${transferStatus}`,
      };
      this.notificationService.createAsync(notificationPayload);

      return { success: true };
    }
  }
}
