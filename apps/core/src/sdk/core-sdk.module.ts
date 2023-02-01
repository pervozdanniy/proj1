import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from '~svc/core/src/sdk/payment-gateway/payment-gateway.module';

@Module({
  imports: [PaymentGatewayModule],
})
export class CoreSdkModule {}
