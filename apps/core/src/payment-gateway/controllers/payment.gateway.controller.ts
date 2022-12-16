import { UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentGatewayService } from '../services/payment.gateway.service';
import { GetTokenRequest, PaymentGatewayControllerMethods } from '~common/grpc/interfaces/prime_trust';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { TypeOrmExceptionFilter } from '~common/utils/filters/type-orm-exception.filter';

@RpcController()
@UseFilters(TypeOrmExceptionFilter)
@PaymentGatewayControllerMethods()
export class PaymentGatewayController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @GrpcMethod('PaymentGatewayService', 'GetToken')
  async getToken(request: GetTokenRequest) {
    return this.paymentGatewayService.getToken(request);
  }
}
