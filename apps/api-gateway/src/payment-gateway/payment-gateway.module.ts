import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [PaymentGatewayController],
})
export class PaymentGatewayModule {}
