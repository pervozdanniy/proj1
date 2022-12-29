import { UseFilters } from '@nestjs/common';
import { IdRequest, SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  BalanceResponse,
  PaymentGatewayListQuery,
  PaymentGatewayListResponse,
  PaymentGatewayServiceController,
  PaymentGatewayServiceControllerMethods,
  PG_Token,
  PrimeTrustData,
  TokenSendRequest,
  TransferMethodRequest,
  UpdateAccountRequest,
  UploadDocumentRequest,
  WithdrawalParams,
  WithdrawalParamsResponse,
} from '~common/grpc/interfaces/payment-gateway';
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

  async createAccount(request: TokenSendRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.createAccount(request);
  }

  async createContact(request: TokenSendRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.createContact(request);
  }

  async uploadDocument(request: UploadDocumentRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.uploadDocument(request);
  }

  updateAccount(request: UpdateAccountRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.updateAccount(request);
  }
  documentCheck(request: AccountIdRequest): Promise<SuccessResponse> {
    return this.paymentGatewayService.documentCheck(request);
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

  list(request: PaymentGatewayListQuery): Promise<PaymentGatewayListResponse> {
    return this.paymentGatewayService.list(request);
  }
}
