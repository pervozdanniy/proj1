import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { CountryServiceClient } from '~common/grpc/interfaces/country';
import { CountriesListDto } from '~svc/api-gateway/src/api/country/dtos/countries-list.dto';

@Injectable()
export class CountryService implements OnModuleInit {
  private countryService: CountryServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc) {}

  async onModuleInit() {
    this.countryService = this.core.getService('CountryService');
  }

  list(query: CountriesListDto) {
    return firstValueFrom(this.countryService.list(query));
  }
}
