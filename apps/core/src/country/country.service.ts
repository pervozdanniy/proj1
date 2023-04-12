import { states } from '@/user/constants/states';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { Country, CountryListResponse } from '~common/grpc/interfaces/country';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { UserDetailsDto } from '../user/dto/user-request.dto';

const countries: Country[] = [
  { code: 'US', name: 'United States of America' },
  { code: 'CL', name: 'Chile' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
];

@Injectable()
export class CountryService {
  list(): CountryListResponse {
    return { items: countries };
  }

  checkUSA(details: UserDetailsDto) {
    if (!details.region || !states.find((e) => e == details.region)) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Please fill region for USA!', 400);
    }

    if (String(details.tax_id_number).length !== 9) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Must be a valid tax ID number (9 digits in the US)!', 400);
    }
  }
}
