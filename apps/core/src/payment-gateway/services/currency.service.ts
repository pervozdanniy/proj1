import { HttpService } from '@nestjs/axios';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Rates, ratesData } from '../country/data';

export type CurrencyCode = string;

@Injectable()
export class CurrencyService implements OnApplicationBootstrap {
  protected readonly api_key: string;

  public ratesData: Rates;
  constructor(private readonly http: HttpService) {
    this.api_key = '9OAx3LWiI1deEbZfCGQBjwSPrNE6M3YE';
  }

  async onApplicationBootstrap(): Promise<void> {
    this.ratesData = await this.rates('USD', ...ratesData);
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

  async convert(amount: number, currencies: string[]) {
    if (Object.keys(this.ratesData).length === 0) {
      await this.createOrUpdateRates();
    }
    const rates: Rates = this.ratesData;
    const selectedRates: any = {};
    for (let i = 0; i < currencies.length; i++) {
      const param = currencies[i];
      if (rates.hasOwnProperty(param)) {
        selectedRates[param] = rates[param];
      }
    }
    for (const curr in selectedRates) {
      if (Object.prototype.hasOwnProperty.call(rates, curr)) {
        selectedRates[curr] = { amount: (selectedRates[curr] * amount).toFixed(2), rate: selectedRates[curr] };
      }
    }

    return selectedRates;
  }

  async createOrUpdateRates() {
    this.ratesData = await this.rates('USD', ...ratesData);
  }
}
