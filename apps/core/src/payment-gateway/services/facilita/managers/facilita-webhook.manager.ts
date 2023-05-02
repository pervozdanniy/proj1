import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { FacilitaWebhookRequest } from '~common/grpc/interfaces/payment-gateway';

@Injectable()
export class FacilitaWebhookManager {
  private readonly logger = new Logger(FacilitaWebhookManager.name);
  private readonly url: string;
  private readonly username: string;
  private readonly password: string;
  constructor(config: ConfigService<ConfigInterface>) {
    const { facilita_url } = config.get('app', { infer: true });
    const { username, password } = config.get('facilita', { infer: true });
    this.username = username;
    this.password = password;
    this.url = facilita_url;
  }

  async facilitaWebhooksHandler({ orderId }: FacilitaWebhookRequest): Promise<SuccessResponse> {
    this.logger.log(this.url, this.username, this.password, orderId);

    return { success: true };
  }
}
