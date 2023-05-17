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
import { VeriffHookDto } from '../dtos/veriff/veriff-hook.dto';
import { VeriffWebhookDto } from '../dtos/veriff/veriff-webhook.dto';
import { FacilitaWebhookType, KoyweWebhookType, LiquidoWebhookType, PrimeTrustWebhookType } from '../webhooks/data';

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

  getBalance(id: number, currencies?: string[]) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBalance({ user_id: id, currencies: currencies ?? [] }));
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

  payfuraHandler(payload: FacilitaWebhookType) {
    return lastValueFrom(this.paymentGatewayServiceClient.facilitaWebhooksHandler(payload));
  }

  transferToHotWallet() {
    return lastValueFrom(this.paymentGatewayServiceClient.transferToHotWallet({}));
  }

  exchange({ currencies, currency_type }: ExchangeDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.exchange({ currencies, currency_type }));
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

  liquidoHandler({ data: { amount, currency, country, email, paymentStatus, orderId } }: LiquidoWebhookType) {
    return lastValueFrom(
      this.paymentGatewayServiceClient.liquidoWebhooksHandler({
        amount,
        currency,
        country,
        email,
        paymentStatus,
        orderId,
      }),
    );
  }
}
