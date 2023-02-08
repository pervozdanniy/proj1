import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryModule } from '../country/country.module';
import { CountryEntity } from '../country/entities/country.entity';
import { UserController } from './controllers/user.controller';
import { UserContactEntity } from './entities/user-contact.entity';
import { UserDetailsEntity } from './entities/user-details.entity';
import { UserEntity } from './entities/user.entity';
import { UserContactService } from './services/user-contact.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    HttpModule,
    CountryModule,
    TypeOrmModule.forFeature([UserEntity, UserContactEntity, CountryEntity, UserDetailsEntity]),
  ],
  providers: [UserService, UserContactService],

  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
