import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './controllers/payment.gateway.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [PaymentGatewayController],
})
export class PaymentGatewayModule {}
