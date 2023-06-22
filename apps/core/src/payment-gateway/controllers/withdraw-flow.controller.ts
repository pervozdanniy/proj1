import {
  DepositNextStepRequest,
  TransferInfo,
  WithdrawFlowRequest,
  WithdrawFlowResponse,
  WithdrawFlowServiceController,
  WithdrawFlowServiceControllerMethods,
} from '~common/grpc/interfaces/payment-gateway';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { WithdrawFlowService } from '../services/flow/withdraw-flow.service';

@RpcController()
@WithdrawFlowServiceControllerMethods()
export class WithdrawFlowController implements WithdrawFlowServiceController {
  constructor(private readonly flow: WithdrawFlowService) {}

  start(request: WithdrawFlowRequest): Promise<WithdrawFlowResponse> {
    return this.flow.start(request);
  }
  payWithSelectedResource(request: DepositNextStepRequest): Promise<TransferInfo> {
    return this.flow.pay(request);
  }
}
