import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import {
  BankAccountParams,
  PaymentGatewayServiceClient,
  SearchTransactionRequest,
  TransferFundsRequest,
  TransferMethodRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { ExchangeDto } from '../dtos/main/exchange.dto';
import {
  FacilitaWebhookType,
  KoyweWebhookType,
  LinkWebhookType,
  LiquidoDepositWebhookType,
  LiquidoPayoutWebhookType,
  PrimeTrustWebhookType,
} from '../webhooks/data';

@Injectable()
export class PaymentGatewayService implements OnModuleInit {
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.paymentGatewayServiceClient = this.client.getService('PaymentGatewayService');
  }

  getContact(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getContact(data));
  }

  getBalance(userId: number, currencies?: string[]) {
    return lastValueFrom(
      this.paymentGatewayServiceClient.getBalance({ user_id: userId, currencies: currencies ?? [] }),
    );
  }

  makeWithdrawal(data: TransferMethodRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.makeWithdrawal(data));
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

  getTransactions(data: SearchTransactionRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getTransactions(data));
  }

  getBanksInfo(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBanksInfo(data));
  }

  getAvailablePaymentMethods(id: number) {
    return lastValueFrom(this.paymentGatewayServiceClient.getAvailablePaymentMethods({ id }));
  }

  koyweWebhooksHandler(payload: KoyweWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.koyweWebhooksHandler(payload));
  }

  getUserAccountStatus(id: number) {
    return lastValueFrom(this.paymentGatewayServiceClient.getUserAccountStatus({ id }));
  }

  facilitaHandler({ notification: { transaction_id: transactionId } }: FacilitaWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.facilitaWebhooksHandler({ transactionId }));
  }

  transferToHotWallet() {
    return lastValueFrom(this.paymentGatewayServiceClient.transferToHotWallet({}));
  }

  exchange({ currencies, currency_type }: ExchangeDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.exchange({ currencies, currency_type }));
  }

  primeTrustHandler(data: PrimeTrustWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.primeWebhooksHandler(data));
  }

  liquidoDepositHandler({
    data: { amount, currency, country, email, paymentStatus, orderId },
  }: LiquidoDepositWebhookType) {
    return lastValueFrom(
      this.paymentGatewayServiceClient.liquidoDepositHandler({
        amount,
        currency,
        country,
        email,
        paymentStatus,
        orderId,
      }),
    );
  }

  getBankAccounts(data: UserIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBankAccounts(data));
  }

  linkHandler({ metadata: { resourceId, resourceType }, eventType }: LinkWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.linkHandler({ resourceId, eventType, resourceType }));
  }

  liquidoWithdrawHandler({ idempotencyKey, transferStatus }: LiquidoPayoutWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.liquidoWithdrawHandler({ idempotencyKey, transferStatus }));
  }
}
