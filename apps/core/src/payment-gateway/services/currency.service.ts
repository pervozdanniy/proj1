import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { ratesData } from '../country/data';

export type CurrencyCode = string;

@Injectable()
export class CurrencyService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurrencyService.name);
  protected readonly api_key: string;

  private ratesData: Map<string, number>;
  constructor(private readonly http: HttpService, config: ConfigService<ConfigInterface>) {
    const { key } = config.get('api_layer', { infer: true });
    this.api_key = key;
  }

  async onApplicationBootstrap(): Promise<void> {
    this.ratesData = await this.ratesUsd(...ratesData);
  }

  async rates<T extends CurrencyCode[]>(from: CurrencyCode, ...to: T) {
    const { data } = await lastValueFrom(
      this.http.get(`https://api.apilayer.com/exchangerates_data/latest?symbols=${to.join(',')}&base=${from}`, {
        headers: {
          apikey: this.api_key,
        },
      }),
    );

    const ratesMap = new Map<string, number>(Object.entries(data['rates']) as [string, number][]);

    return ratesMap;
  }

  async ratesUsd<T extends CurrencyCode[]>(...codes: T) {
    return this.rates('USD', ...codes);
  }

  async convert(amount: number, currencies: string[]) {
    const selectedRates: any = {};

    for (const param of currencies) {
      if (this.ratesData.has(param)) {
        selectedRates[param] = {
          amount: (this.ratesData.get(param) * amount).toFixed(2),
          rate: this.ratesData.get(param),
        };
      }
    }

    return selectedRates;
  }

  async createOrUpdateRates() {
    this.ratesData = await this.ratesUsd(...ratesData);
  }

  @Cron('0 0 */2 * * *')
  async handleCron() {
    await this.createOrUpdateRates();
    this.logger.log('Rates updated!');
  }
}
