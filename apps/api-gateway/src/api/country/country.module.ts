import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { CountryController } from './controllers/country.controller';
import { CountryService } from './services/country.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
