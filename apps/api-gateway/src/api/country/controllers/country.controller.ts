import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CountriesListDto } from '~svc/api-gateway/src/api/country/dtos/countries-list.dto';
import { CountryService } from '~svc/api-gateway/src/api/country/services/country.service';

@ApiTags('Country')
@Controller({
  version: '1',
  path: 'country',
})
@UseInterceptors(ClassSerializerInterceptor)
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @ApiOperation({ summary: 'Get list of countries' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Query() query: CountriesListDto) {
    return this.countryService.list(query);
  }
}
