import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export type CurrencyCode = string;

export class CurrencyService {
  constructor(private readonly http: HttpService) {}

  async rates<T extends CurrencyCode[]>(from: CurrencyCode, ...to: T) {
    const { data } = await lastValueFrom(
      this.http.get<Record<CurrencyCode, Record<T[number], number>>>(
        `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to.join(',')}`,
      ),
    );

    return data[from];
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