import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { UserModule } from '../user/user.module';
import { UserFacadeController } from './user-facade.controller';

@Module({
  imports: [UserModule, PaymentGatewayModule],
  controllers: [UserFacadeController],
})
export class UserFacadeModule {}
