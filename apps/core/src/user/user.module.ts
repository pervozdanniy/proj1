import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryModule } from '~svc/core/src/country/country.module';
import { NotificationEntity } from '~svc/core/src/notification/entities/notification.entity';
import { CountryEntity } from '../country/entities/country.entity';
import { PaymentGatewayEntity } from '../payment-gateway/entities/payment-gateway.entity';
import { PrimeTrustUserEntity } from '../payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { UserController } from './controllers/user.controller';
import { UserDetailsEntity } from './entities/user-details.entity';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      UserEntity,
      CountryEntity,
      PaymentGatewayEntity,
      PrimeTrustUserEntity,
      UserDetailsEntity,
      NotificationEntity,
    ]),
    CountryModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
