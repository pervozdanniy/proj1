import {
  ContributionResponse,
  DepositFlowRequest,
  DepositFlowResponse,
  DepositFlowServiceController,
  DepositFlowServiceControllerMethods,
  DepositNextStepRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { DepositFlow } from '../services/flow/deposit-flow.service';

@RpcController()
@DepositFlowServiceControllerMethods()
export class DepositFlowController implements DepositFlowServiceController {
  constructor(private readonly flow: DepositFlow) {}

  start(request: DepositFlowRequest): Promise<DepositFlowResponse> {
    return this.flow.start(request);
  }

  payWithBank(request: DepositNextStepRequest): Promise<ContributionResponse> {
    return this.flow.selectBank(request);
  }
}
