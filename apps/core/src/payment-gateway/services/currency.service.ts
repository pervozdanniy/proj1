import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

export type CurrencyCode = string;

@Injectable()
export class CurrencyService {
  protected readonly api_key: string;
  constructor(private readonly http: HttpService) {
    this.api_key = '9OAx3LWiI1deEbZfCGQBjwSPrNE6M3YE';
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

  async convert(amount: number, from: CurrencyCode, ...to: CurrencyCode[]) {
    const rates = await this.rates(from, ...to);
    for (const curr in rates) {
      if (Object.prototype.hasOwnProperty.call(rates, curr)) {
        rates[curr] = rates[curr] * amount;
      }
    }

    return rates;
  }

  convertUsd(amount: number, ...to: CurrencyCode[]) {
    return this.convert(amount, 'USD', ...to);
  }
}
