import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { CountryController } from '~svc/api-gateway/src/api/country/controllers/country.controller';
import { CountryService } from '~svc/api-gateway/src/api/country/services/country.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
