import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { UserModule } from '../user/user.module';
import { UserFacadeController } from './user-facade.controller';
import { UserFacadeService } from './user-facade.service';

@Module({
  imports: [UserModule, PaymentGatewayModule],
  controllers: [UserFacadeController],
  providers: [UserFacadeService],
})
export class UserFacadeModule {}
