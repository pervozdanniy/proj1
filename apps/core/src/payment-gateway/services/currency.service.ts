import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { ConvertedRates, currenciesData, CurrencyCode } from '../country/data';

@Injectable()
export class CurrencyService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly api_key: string;

  private ratesPromise: Promise<Error>;
  private ratesData: Map<string, number> = new Map<string, number>();

  constructor(private readonly http: HttpService, config: ConfigService<ConfigInterface>) {
    const { key } = config.get('api_layer', { infer: true });
    this.api_key = key;
  }

  async onApplicationBootstrap(): Promise<void> {
    this.ratesPromise = this.updateRates();
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
    if (this.ratesData.size === 0) {
      const error = await this.ratesPromise;
      if (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

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
      throw 'PIZA';
      rates = await this.ratesUsd(...currenciesData);
    } catch (error) {
      this.logger.error('Rates update failed!', error);

      return error;
    }
    Object.keys(rates).forEach((key) => {
      this.ratesData.set(key, rates[key]);
    });
    this.logger.debug('Rates updated!');
  }

  @Cron('0 0 */2 * * *')
  async handleCron() {
    this.ratesPromise = this.updateRates();
  }
}
