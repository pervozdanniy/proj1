import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AwsModule } from '~svc/core/src/aws/AwsModule';
import { PaymentGatewayModule } from '~svc/core/src/payment-gateway/payment.gateway.module';

@Module({
  imports: [AwsModule, forwardRef(() => PaymentGatewayModule), TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
