import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SandboxGatewayController } from '~svc/api-gateway/src/payment-gateway/controllers/sandbox-gateway.controller';
import { SandboxService } from '~svc/api-gateway/src/payment-gateway/sandbox/sandbox.service';
import { HandlerService } from '~svc/api-gateway/src/payment-gateway/webhook/handlers/handler.service';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [HttpModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [PaymentGatewayController, SandboxGatewayController],
  providers: [HandlerService, SandboxService],
})
export class PaymentGatewayModule {}
