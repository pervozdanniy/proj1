import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { HandlerService } from '~svc/api-gateway/src/payment-gateway/webhook/handlers/handler.service';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [PaymentGatewayController],
  providers: [HandlerService],
})
export class PaymentGatewayModule {}
