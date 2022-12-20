import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { CountryEntity } from './entities/country.entity';
import { PaymentGatewayEntity } from './entities/payment-gateway.entity';
import { PrimeTrustUserEntity } from './entities/prime-trust-user.entity';
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
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
