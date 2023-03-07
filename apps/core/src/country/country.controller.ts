import {
  CountryListResponse,
  CountryServiceController,
  CountryServiceControllerMethods,
} from '~common/grpc/interfaces/country';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { CountryService } from './country.service';

@RpcController()
@CountryServiceControllerMethods()
export class CountryController implements CountryServiceController {
  constructor(private countryService: CountryService) {}

  list(): CountryListResponse {
    return this.countryService.list();
  }
}
