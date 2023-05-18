import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrencyService } from '../services/currency.service';

@Injectable()
export class RatesUpdateService {
  private readonly logger = new Logger(RatesUpdateService.name);
  constructor(private readonly currencyService: CurrencyService) {}

  @Cron('0 0 */2 * * *')
  async handleCron() {
    await this.currencyService.createOrUpdateRates();
    this.logger.log('Rates updated!');
  }
}
