import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AwsModule } from '~svc/core/src/aws/AwsModule';
import { CountryEntity } from '~svc/core/src/user/entities/country.entity';
import { PaymentGatewayEntity } from '~svc/core/src/user/entities/payment.gateway.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { HttpModule } from '@nestjs/axios';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user.details.entity';

@Module({
  imports: [
    HttpModule,
    AwsModule,
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
