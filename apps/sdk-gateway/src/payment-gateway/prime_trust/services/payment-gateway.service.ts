import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import {
  BankAccountParams,
  MakeDepositRequest,
  PaymentGatewayServiceClient,
  SearchTransactionRequest,
  TransferFundsRequest,
  TransferMethodRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { VeriffHookDto } from '../dtos/veriff/veriff-hook.dto';
import { VeriffWebhookDto } from '../dtos/veriff/veriff-webhook.dto';
import { KoyweWebhookType, PrimeTrustWebhookType } from '../webhooks/data';

@Injectable()
export class PaymentGatewayService implements OnModuleInit {
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.paymentGatewayServiceClient = this.client.getService('PaymentGatewayService');
  }

  getBalance(id: number, currencies?: string[]) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBalance({ user_id: id, currencies: currencies ?? [] }));
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

  transferFunds(data: TransferFundsRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.transferFunds(data));
  }

  addBankAccountParams(data: BankAccountParams) {
    return lastValueFrom(this.paymentGatewayServiceClient.addBankAccountParams(data));
  }

  makeDeposit(data: MakeDepositRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.makeDeposit(data));
  }
  getContact(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getContact(data));
  }

  getTransactions(data: SearchTransactionRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getTransactions(data));
  }

  getBanksInfo(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBanksInfo(data));
  }

  koyweWebhooksHandler(data: KoyweWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.koyweWebhooksHandler(data));
  }

  getUserAccountStatus(id: number) {
    return lastValueFrom(this.paymentGatewayServiceClient.getUserAccountStatus({ id }));
  }

  generateVeriffLink(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.generateVeriffLink(data));
  }

  veriffHookHandler(data: VeriffHookDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.veriffHookHandler(data));
  }

  veriffWebhookHandler(data: VeriffWebhookDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.veriffWebhookHandler(data));
  }

  primeTrustHandler(data: PrimeTrustWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.primeWebhooksHandler(data));
  }
}
