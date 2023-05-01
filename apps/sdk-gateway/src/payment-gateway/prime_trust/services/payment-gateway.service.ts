import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  BankAccountParams,
  CreateReferenceRequest,
  DepositParamRequest,
  MakeDepositRequest,
  PaymentGatewayServiceClient,
  SearchTransactionRequest,
  TransferFundsRequest,
  TransferMethodRequest,
  UploadDocumentRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { KoyweWebhookType } from '../webhooks/data';

@Injectable()
export class PaymentGatewayService implements OnModuleInit {
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.paymentGatewayServiceClient = this.client.getService('PaymentGatewayService');
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

  getToken() {
    return lastValueFrom(this.paymentGatewayServiceClient.getToken({}));
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

  getBalance(id: number, currencies?: string[]) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBalance({ user_id: id, currencies: currencies ?? [] }));
  }

  async createReference(data: CreateReferenceRequest) {
    const response = await lastValueFrom(this.paymentGatewayServiceClient.createReference(data));

    return { data: JSON.parse(response.data) };
  }

  async makeWithdrawal(data: TransferMethodRequest) {
    const response = await lastValueFrom(this.paymentGatewayServiceClient.makeWithdrawal(data));

    return { data: JSON.parse(response.data) };
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

  makeDeposit(data: MakeDepositRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.makeDeposit(data));
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

  getTransactions(data: SearchTransactionRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getTransactions(data));
  }

  getBanksInfo(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBanksInfo(data));
  }

  updateAssetDeposit(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.updateAssetDeposit(data));
  }

  koyweWebhooksHandler(data: KoyweWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.koyweWebhooksHandler(data));
  }

  getDepositParams(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getDepositParams(data));
  }

  getUserAccountStatus(id: number) {
    return lastValueFrom(this.paymentGatewayServiceClient.getUserAccountStatus({ id }));
  }

  updateContact(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.updateContact(data));
  }

  contingentHolds(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.contingentHolds(data));
  }
}