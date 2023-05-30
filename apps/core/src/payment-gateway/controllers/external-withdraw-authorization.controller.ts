import {
  ExternalWithdrawAuthorizationRequest,
  ExternalWithdrawAuthorizationResponse,
  ExternalWithdrawAuthorizationServiceController,
  ExternalWithdrawAuthorizationServiceControllerMethods,
  ExternalWithdrawUpdateRequest,
} from '~common/grpc/interfaces/inswitch';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { WithdrawAuthorizationService } from '../services/external-withdraw-authorization/withdraw-authorization.service';

@RpcController()
@ExternalWithdrawAuthorizationServiceControllerMethods()
export class ExternalWithdrawAuthorizationController implements ExternalWithdrawAuthorizationServiceController {
  constructor(private readonly handler: WithdrawAuthorizationService) {}

  async authorize({ payload }: ExternalWithdrawAuthorizationRequest): Promise<ExternalWithdrawAuthorizationResponse> {
    const { authorizationId, status } = await this.handler.authorize(JSON.parse(Buffer.from(payload).toString('utf8')));

    return { authorization_id: authorizationId, status };
  }

  async update({ payload }: ExternalWithdrawUpdateRequest) {
    await this.handler.update(JSON.parse(Buffer.from(payload).toString('utf8')));
  }
}
