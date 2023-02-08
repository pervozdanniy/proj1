import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryController } from '~svc/core/src/country/controllers/country.controller';
import { CountryService } from '~svc/core/src/country/services/country.service';
import { CountryEntity } from './entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity])],
  providers: [CountryService],
  controllers: [CountryController],
  exports: [CountryService],
})
export class CountryModule {}
