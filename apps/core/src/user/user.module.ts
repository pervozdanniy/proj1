import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AwsModule } from '~svc/core/src/aws/AwsModule';
import { PaymentGatewayModule } from '~svc/core/src/payment-gateway/payment.gateway.module';
import { CountryEntity } from '~svc/core/src/user/entities/country.entity';
import { PaymentGatewayEntity } from '~svc/core/src/user/entities/payment.gateway.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { BullModule } from '@nestjs/bull';
import { FailedRequestsProcessor } from '~svc/core/src/user/services/failed.requests.processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    AwsModule,
    forwardRef(() => PaymentGatewayModule),
    TypeOrmModule.forFeature([UserEntity, CountryEntity, PaymentGatewayEntity, PrimeTrustUserEntity]),
    BullModule.registerQueue({
      name: 'prime_trust_failed',
    }),
  ],
  providers: [UserService, FailedRequestsProcessor],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
