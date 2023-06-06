import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Fraction from 'fraction.js';
import { IsNull, Repository } from 'typeorm';
import { FeeEntity } from './entities/fee.entity';

@Injectable()
export class FeeService {
  constructor(@InjectRepository(FeeEntity) private readonly fees: Repository<FeeEntity>) {}

  async calculate(amountUsd: number | string, country: string) {
    const fee = await this.fees.findOneBy([{ country }, { country: IsNull() }]);
    if (!fee) {
      return { total: new Fraction(amountUsd), fee: new Fraction(0) };
    }

    let total = new Fraction(amountUsd).mul(fee.percent).div(100);
    if (fee.fixed_usd) {
      total = total.add(fee.fixed_usd);
    }

    return { total, fee: total.sub(amountUsd) };
  }
}
