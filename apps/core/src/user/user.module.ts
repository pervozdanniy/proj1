import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryModule } from '~svc/core/src/country/country.module';
import { CountryService } from '~svc/core/src/country/services/country.service';
import { NotificationEntity } from '~svc/core/src/notification/entities/notification.entity';
import { CountryEntity } from '../country/entities/country.entity';
import { PaymentGatewayEntity } from '../payment-gateway/entities/payment-gateway.entity';
import { PrimeTrustUserEntity } from '../payment-gateway/entities/prime_trust/prime-trust-user.entity';
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
      PrimeTrustUserEntity,
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
