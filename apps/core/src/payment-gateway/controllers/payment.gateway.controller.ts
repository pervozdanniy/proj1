import { Controller, UseFilters } from '@nestjs/common';
import { TypeOrmExceptionFilter } from '~common/filters/type-orm-exception.filter';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentGatewayService } from '../services/payment.gateway.service';
import { GetTokenRequest } from '~common/grpc/interfaces/api-gateway/prime_trust';

@Controller()
@UseFilters(TypeOrmExceptionFilter)
export class PaymentGatewayController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @GrpcMethod('PaymentGatewayService', 'GetToken')
  async getToken(request: GetTokenRequest) {
    return this.paymentGatewayService.getToken(request);
  }
}
