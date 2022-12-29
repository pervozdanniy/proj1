import { UseFilters } from '@nestjs/common';
import {
  CountryListQuery,
  CountryListResponse,
  CountryServiceController,
  CountryServiceControllerMethods,
} from '~common/grpc/interfaces/country';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { TypeOrmExceptionFilter } from '~common/utils/filters/type-orm-exception.filter';
import { CountryService } from '~svc/core/src/country/services/country.service';

@RpcController()
@UseFilters(TypeOrmExceptionFilter)
@CountryServiceControllerMethods()
export class CountryController implements CountryServiceController {
  constructor(private countryService: CountryService) {}

  list(request: CountryListQuery): Promise<CountryListResponse> {
    return this.countryService.list(request);
  }
}
