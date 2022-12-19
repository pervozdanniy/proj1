import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from '~svc/core/src/user/entities/country.entity';
import { PaymentGatewayEntity } from '~svc/core/src/user/entities/payment-gateway.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime-trust-user.entity';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';
import { UserController } from './controllers/user.controller';
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
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
