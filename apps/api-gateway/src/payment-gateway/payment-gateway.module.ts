import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SandboxGatewayController } from '~svc/api-gateway/src/payment-gateway/controllers/sandbox-gateway.controller';
import { PaymentGatewayService } from '~svc/api-gateway/src/payment-gateway/services/payment-gateway.service';
import { SandboxService } from '~svc/api-gateway/src/payment-gateway/services/sandbox.service';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [HttpModule, ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [PaymentGatewayController, SandboxGatewayController],
  providers: [PaymentGatewayService, SandboxService],
})
export class PaymentGatewayModule {}
