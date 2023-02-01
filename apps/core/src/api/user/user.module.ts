import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryModule } from '~svc/core/src/api/country/country.module';
import { CountryService } from '~svc/core/src/api/country/services/country.service';
import { NotificationEntity } from '~svc/core/src/api/notification/entities/notification.entity';
import { PaymentGatewayEntity } from '../../sdk/payment-gateway/entities/payment-gateway.entity';
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
    TypeOrmModule.forFeature([
      UserEntity,
      UserContactEntity,
      CountryEntity,
      PaymentGatewayEntity,
      UserDetailsEntity,
      NotificationEntity,
      CountryModule,
    ]),
  ],
  providers: [UserService, CountryService, UserContactService],

  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
