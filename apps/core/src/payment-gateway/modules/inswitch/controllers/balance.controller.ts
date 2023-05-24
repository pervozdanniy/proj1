import {
  ExternalBalanceResponse,
  ExternalBalanceServiceController,
  ExternalBalanceServiceControllerMethods,
  UserId,
} from '~common/grpc/interfaces/inswitch';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { InswitchService } from '../services/inswitch.service';

@RpcController()
@ExternalBalanceServiceControllerMethods()
export class ExternalBalanceController implements ExternalBalanceServiceController {
  constructor(private readonly inswitch: InswitchService) {}

  async getBalance({ user_id }: UserId): Promise<ExternalBalanceResponse> {
    const balance = await this.inswitch.balance(user_id);

    return { balance };
  }
}
