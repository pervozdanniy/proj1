import {
  CountryListQuery,
  CountryListResponse,
  CountryServiceController,
  CountryServiceControllerMethods,
} from '~common/grpc/interfaces/country';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { CountryService } from '../services/country.service';

@RpcController()
@CountryServiceControllerMethods()
export class CountryController implements CountryServiceController {
  constructor(private countryService: CountryService) {}

  list(request: CountryListQuery): Promise<CountryListResponse> {
    return this.countryService.list(request);
  }
}
