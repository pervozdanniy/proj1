import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { LiquidoTokenManager } from './liquido-token.manager';

@Injectable()
export class LiquidoWithdrawalManager {
  private readonly logger = new Logger(LiquidoWithdrawalManager.name);
  private readonly api_url: string;
  private readonly x_api_key: string;
  private readonly asset: string;
  constructor(config: ConfigService<ConfigInterface>, private liquidoTokenManager: LiquidoTokenManager) {
    const { x_api_key, api_url } = config.get('liquido', { infer: true });
    const { short } = config.get('asset');
    this.x_api_key = x_api_key;
    this.api_url = api_url;
    this.asset = short;
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<string> {
    const token = await this.liquidoTokenManager.getToken();
    this.logger.log(request, this.api_url, this.api_url, this.asset, this.x_api_key, token);
    //liquido withdrawal logic (create wallet)

    return 'wallet address';
  }
}
