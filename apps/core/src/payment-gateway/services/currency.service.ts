import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ratesData } from '../country/data';
import { RateEntity } from '../rate/rate.entity';

export type CurrencyCode = string;

@Injectable()
export class CurrencyService {
  protected readonly api_key: string;
  constructor(
    private readonly http: HttpService,
    @InjectRepository(RateEntity)
    private readonly rateEntityRepository: Repository<RateEntity>,
  ) {
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

  async convert(amount: number, currencies: string[]) {
    let currentRates = await this.rateEntityRepository
      .createQueryBuilder('r')
      .where('r.currency IN (:...currencies)', { currencies })
      .getMany();
    const rates: any = {};
    if (currentRates.length === 0) {
      await this.createOrUpdateRates();
      currentRates = await this.rateEntityRepository
        .createQueryBuilder('r')
        .where('r.currency IN (:...currencies)', { currencies })
        .getMany();
    }

    currentRates.map((r) => {
      rates[r.currency] = { amount: (parseFloat(r.rate) * amount).toFixed(2), rate: r.rate };
    });

    return rates;
  }

  async createOrUpdateRates() {
    const rates = await this.rates('USD', ratesData.join(','));
    for (const currency in rates) {
      if (rates.hasOwnProperty(currency)) {
        const rate = rates[currency];
        const currentRate = await this.rateEntityRepository.findOneBy({ currency });
        if (!currentRate) {
          await this.rateEntityRepository.save(
            this.rateEntityRepository.create({
              currency,
              rate,
            }),
          );
        } else {
          await this.rateEntityRepository.update({ currency }, { rate });
        }
      }
    }
  }
}
