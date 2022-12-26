import { UseFilters } from '@nestjs/common';
import { IdRequest, SuccessResponse } from '~common/grpc/interfaces/common';
import {
  PaymentGatewayServiceController,
  PaymentGatewayServiceControllerMethods,
  PG_Token,
} from '~common/grpc/interfaces/payment-gateway';
import { CreateAccountRequest } from '~common/grpc/interfaces/prime_trust';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { TypeOrmExceptionFilter } from '~common/utils/filters/type-orm-exception.filter';
import { PaymentGatewayService } from '../services/payment.gateway.service';

@RpcController()
@UseFilters(TypeOrmExceptionFilter)
@PaymentGatewayServiceControllerMethods()
export class PaymentGatewayController implements PaymentGatewayServiceController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  async createUser({ id }: IdRequest): Promise<SuccessResponse> {
    const success = await this.paymentGatewayService.createUser(id);

    return { success };
  }

  async getToken({ id }: IdRequest): Promise<PG_Token> {
    return this.paymentGatewayService.getToken(id);
  }

  async createAccount(request: CreateAccountRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.createAccount(request);
  }
}
