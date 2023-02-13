import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  BankAccountParams,
  DepositParamRequest,
  MakeContributionRequest,
  PaymentGatewayServiceClient,
  TransferFundsRequest,
  TransferMethodRequest,
  UploadDocumentRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { PaymentGatewaysListDto } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/dtos/payment-gateways-list.dto';

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

  createCreditCardResource(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.createCreditCardResource(data));
  }

  verifyCreditCard(data: VerifyCreditCardRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.verifyCreditCard(data));
  }

  getCreditCards(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getCreditCards(data));
  }

  transferFunds(data: TransferFundsRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.transferFunds(data));
  }

  addBankAccountParams(data: BankAccountParams) {
    return lastValueFrom(this.paymentGatewayServiceClient.addBankAccountParams(data));
  }

  getBankAccounts(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBankAccounts(data));
  }

  makeContribution(data: MakeContributionRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.makeContribution(data));
  }

  getAccount(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getAccount(data));
  }

  getContact(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getContact(data));
  }
  addDepositParams(data: DepositParamRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.addDepositParams(data));
  }

  getTransactions(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getTransactions(data));
  }

  getTransferById(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getTransferById(data));
  }
}
