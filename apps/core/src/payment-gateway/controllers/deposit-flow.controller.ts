import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  DepositFlowResponse,
  DepositFlowServiceController,
  DepositFlowServiceControllerMethods,
  DepositNextStepRequest,
  TransferInfo,
} from '~common/grpc/interfaces/payment-gateway';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { DepositFlowStartRequestDto } from '../dto/deposit-flow.dto';
import { DepositFlow } from '../services/flow/deposit-flow.service';

@RpcController()
@DepositFlowServiceControllerMethods()
export class DepositFlowController implements DepositFlowServiceController {
  constructor(private readonly flow: DepositFlow) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  start(request: DepositFlowStartRequestDto): Promise<DepositFlowResponse> {
    return this.flow.start(request);
  }

  payWithSelectedResource(request: DepositNextStepRequest): Promise<TransferInfo> {
    return this.flow.payWithSelectedRecource(request);
  }
}
