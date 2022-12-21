import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [PaymentGatewayController],
})
export class PaymentGatewayModule {}
