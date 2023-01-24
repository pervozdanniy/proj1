import { IdRequest, SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  BalanceResponse,
  PaymentGatewayListQuery,
  PaymentGatewayListResponse,
  PaymentGatewayRequest,
  PaymentGatewayServiceController,
  PaymentGatewayServiceControllerMethods,
  PG_Token,
  PrimeTrustData,
  TokenSendRequest,
  TransferMethodRequest,
  UploadDocumentRequest,
  WithdrawalParams,
  WithdrawalParamsResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { PaymentGatewayService } from '../services/payment.gateway.service';

@RpcController()
@PaymentGatewayServiceControllerMethods()
export class PaymentGatewayController implements PaymentGatewayServiceController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  getToken({ id }: IdRequest): Promise<PG_Token> {
    return this.paymentGatewayService.getToken(id);
  }

  createAccount(request: TokenSendRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.createAccount(request);
  }

  createContact(request: TokenSendRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.createContact(request);
  }

  uploadDocument(request: UploadDocumentRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.uploadDocument(request);
  }

  updateAccount(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.updateAccount(request);
  }
  documentCheck(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.documentCheck(request);
  }

  cipCheck(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.cipCheck(request);
  }

  createReference(request: TokenSendRequest): Promise<PrimeTrustData> {
    return this.paymentGatewayService.createReference(request);
  }

  updateBalance(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.updateBalance(request);
  }

  getBalance(request: TokenSendRequest): Promise<BalanceResponse> {
    return this.paymentGatewayService.getBalance(request);
  }

  addWithdrawalParams(request: WithdrawalParams): Promise<WithdrawalParamsResponse> {
    return this.paymentGatewayService.addWithdrawalParams(request);
  }

  makeWithdrawal(request: TransferMethodRequest): Promise<PrimeTrustData> {
    return this.paymentGatewayService.makeWithdrawal(request);
  }

  updateWithdraw(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.updateWithdraw(request);
  }

  updateContribution(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.updateContribution(request);
  }

  list(request: PaymentGatewayListQuery): Promise<PaymentGatewayListResponse> {
    return this.paymentGatewayService.list(request);
  }
}
