import { CountryModule } from '@/country/country.module';
import dbConfig from '@/db/db.config';
import { UserCheckService } from '@/user/services/user-check.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '~common/config/configuration';
import { UserContactEntity } from './entities/user-contact.entity';
import { UserDetailsEntity } from './entities/user-details.entity';
import { UserEntity } from './entities/user.entity';
import { UserContactService } from './services/user-contact.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
    HttpModule,
    CountryModule,
    TypeOrmModule.forFeature([UserEntity, UserContactEntity, UserDetailsEntity]),
  ],
  providers: [UserService, UserContactService, UserCheckService],

  exports: [UserService, UserContactService],
})
export class UserModule {}
