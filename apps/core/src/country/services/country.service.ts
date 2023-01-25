import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryListResponse } from '~common/grpc/interfaces/country';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { CountryEntity } from '~svc/core/src/country/entities/country.entity';
import { states } from '~svc/core/src/user/constants/states';

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
  checkUSA(details) {
    if (!details.region || !states.find((e) => e == details.region)) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Please fill region for USA!', 400);
    }

    if (String(details.tax_id_number).length !== 9) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Must be a valid tax ID number (9 digits in the US)!', 400);
    }
  }
}