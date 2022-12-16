import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentGatewayService } from '../services/payment.gateway.service';
import { GetTokenRequest } from '~common/grpc/interfaces/prime_trust';

@Controller()
export class PaymentGatewayController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @GrpcMethod('PaymentGatewayService', 'GetToken')
  async getToken(request: GetTokenRequest) {
    return this.paymentGatewayService.getToken(request);
  }
}
