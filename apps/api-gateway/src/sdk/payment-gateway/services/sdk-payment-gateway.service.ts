import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  PaymentGatewayServiceClient,
  TransferFundsRequest,
  TransferMethodRequest,
  UploadDocumentRequest,
  UserIdRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { PaymentGatewaysListDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/payment-gateways-list.dto';

@Injectable()
export class SdkPaymentGatewayService implements OnModuleInit {
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.paymentGatewayServiceClient = this.client.getService('PaymentGatewayService');
  }

  list(query: PaymentGatewaysListDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.list(query));
  }

  updateAccount(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.updateAccount(data));
  }

  documentCheck(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.documentCheck(data));
  }

  updateBalance(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.updateBalance(data));
  }

  cipCheck(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.cipCheck(data));
  }

  getToken(id: number) {
    return lastValueFrom(this.paymentGatewayServiceClient.getToken({ id }));
  }

  createAccount(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.createAccount(data));
  }

  createContact(data: UserIdRequest): Promise<SuccessResponse> {
    return lastValueFrom(this.paymentGatewayServiceClient.createContact(data));
  }

  uploadDocument(data: UploadDocumentRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.uploadDocument(data));
  }

  updateWithdraw(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.updateWithdraw(data));
  }

  updateContribution(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.updateContribution(data));
  }

  getBalance(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBalance(data));
  }

  async createReference(data: UserIdRequest) {
    const response = await lastValueFrom(this.paymentGatewayServiceClient.createReference(data));

    return { data: JSON.parse(response.data) };
  }

  addWithdrawalParams(data: WithdrawalParams) {
    return lastValueFrom(this.paymentGatewayServiceClient.addWithdrawalParams(data));
  }

  async makeWithdrawal(data: TransferMethodRequest) {
    const response = await lastValueFrom(this.paymentGatewayServiceClient.makeWithdrawal(data));

    return { data: JSON.parse(response.data) };
  }

  getWithdrawalParams(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getWithdrawalParams(data));
  }

  transferFunds(data: TransferFundsRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.transferFunds(data));
  }
}
