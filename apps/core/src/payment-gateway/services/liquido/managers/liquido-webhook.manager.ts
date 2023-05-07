import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { LiquidoWebhookRequest } from '~common/grpc/interfaces/payment-gateway';

@Injectable()
export class LiquidoWebhookManager {
  private readonly logger = new Logger(LiquidoWebhookManager.name);
  private readonly api_url: string;
  private readonly x_api_key: string;
  constructor(config: ConfigService<ConfigInterface>) {
    const { api_url, x_api_key } = config.get('liquido', { infer: true });
    this.api_url = api_url;
    this.x_api_key = x_api_key;
  }

  async liquidoWebhooksHandler({ transactionId }: LiquidoWebhookRequest): Promise<SuccessResponse> {
    this.logger.log(transactionId, this.api_url, this.x_api_key);
    //liquido webhook logic

    return { success: true };
  }
}
