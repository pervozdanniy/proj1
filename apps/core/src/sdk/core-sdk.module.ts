import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';

@Module({
  imports: [PaymentGatewayModule],
})
export class CoreSdkModule {}
