import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { ConvertedRates, currenciesData, CurrencyCode } from '../country/data';

@Injectable()
export class CurrencyService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly api_key: string;

  private ratesData: Map<string, number> = new Map<string, number>();
  constructor(private readonly http: HttpService, config: ConfigService<ConfigInterface>) {
    const { key } = config.get('api_layer', { infer: true });
    this.api_key = key;
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.updateRates();
  }

  async rates<T extends CurrencyCode[]>(from: CurrencyCode, ...to: T) {
    const { data } = await lastValueFrom(
      this.http.get(`https://api.apilayer.com/exchangerates_data/latest?symbols=${to.join(',')}&base=${from}`, {
        headers: {
          apikey: this.api_key,
        },
      }),
    );

    return data['rates'];
  }

  async ratesUsd<T extends CurrencyCode[]>(...codes: T) {
    return this.rates('USD', ...codes);
  }

  async convert(amount: number, currencies: CurrencyCode[]): Promise<ConvertedRates> {
    const selectedRates: ConvertedRates = {};

    for (const param of currencies) {
      const rate = this.ratesData.get(param);
      if (rate) {
        selectedRates[param] = {
          amount: rate * amount,
          rate,
        };
      }
    }

    return selectedRates;
  }

  async updateRates() {
    let rates: Record<string, number>;
    try {
      rates = await this.ratesUsd(...currenciesData);
    } catch (error) {
      this.logger.error('Rates update failed!', error);

      return;
    }
    Object.keys(rates).forEach((key) => {
      this.ratesData.set(key, rates[key]);
    });
    this.logger.debug('Rates updated!');
  }

  @Cron('0 0 */2 * * *')
  async handleCron() {
    await this.updateRates();
  }
}
