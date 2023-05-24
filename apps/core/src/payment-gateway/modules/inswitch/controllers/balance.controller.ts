import { UserIdRequest } from '~common/grpc/interfaces/common';
import {
  ExternalBalanceResponse,
  ExternalBalanceServiceController,
  ExternalBalanceServiceControllerMethods,
  ExternalPaymentMethodResponse,
} from '~common/grpc/interfaces/inswitch';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { InswitchService } from '../services/inswitch.service';

@RpcController()
@ExternalBalanceServiceControllerMethods()
export class ExternalBalanceController implements ExternalBalanceServiceController {
  constructor(private readonly inswitch: InswitchService) {}

  async getBalance({ user_id }: UserIdRequest): Promise<ExternalBalanceResponse> {
    const balance = await this.inswitch.balance(user_id);

    return { balance };
  }

  async getPaymentMethodReference({ user_id }: UserIdRequest): Promise<ExternalPaymentMethodResponse> {
    const reference = await this.inswitch.paymentReference(user_id);

    return { reference };
  }
}
