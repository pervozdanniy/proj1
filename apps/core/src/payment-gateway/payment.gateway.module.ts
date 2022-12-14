import { forwardRef, Module } from '@nestjs/common';
import { PaymentGatewayController } from './controllers/payment.gateway.controller';
import { UserModule } from '~svc/core/src/user/user.module';
import { PaymentGatewayService } from '~svc/core/src/payment-gateway/services/payment.gateway.service';
import { HttpModule } from '@nestjs/axios';
import { PaymentGatewayManager } from '~svc/core/src/payment-gateway/manager/payment.gateway.manager';

@Module({
  imports: [forwardRef(() => UserModule), HttpModule],
  providers: [PaymentGatewayService, PaymentGatewayManager],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
