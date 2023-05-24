import { UserIdRequest } from '~common/grpc/interfaces/common';
import {
  DecisionWebhook,
  EventWebhook,
  KYCServiceController,
  KYCServiceControllerMethods,
  VeriffSessionResponse,
} from '~common/grpc/interfaces/veriff';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { KYCService } from '../services/kyc/kyc.service';

@RpcController()
@KYCServiceControllerMethods()
export class KYCController implements KYCServiceController {
  constructor(private readonly kyc: KYCService) {}

  eventHandler(request: EventWebhook) {
    return this.kyc.eventHandler(request);
  }

  decisionHandler(request: DecisionWebhook) {
    return this.kyc.decisionHandler(request);
  }

  generateLink({ user_id }: UserIdRequest): Promise<VeriffSessionResponse> {
    return this.kyc.generateVeriffLink(user_id);
  }
}
