import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryListResponse } from '~common/grpc/interfaces/country';
import { PaymentGatewayListResponse } from '~common/grpc/interfaces/payment-gateway';
import { CountryEntity } from '~svc/core/src/country/entities/country.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(CountryEntity)
    private countryEntityRepository: Repository<CountryEntity>,
  ) {}

  async list(request): Promise<CountryListResponse> {
    const { offset, limit } = request;
    const [items, count] = await this.countryEntityRepository
      .createQueryBuilder('c')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      count,
    };
  }
}
