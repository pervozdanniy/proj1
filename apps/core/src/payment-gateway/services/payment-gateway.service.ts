import { UserService } from '@/user/services/user.service';
import { Injectable } from '@nestjs/common';
import { IdRequest, SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import {
  AccountResponse,
  AgreementRequest,
  BalanceRequest,
  BalanceResponse,
  ExchangeRequest,
  ExchangeResponse,
  LinkCustomerRequest,
  PG_Token,
  SearchTransactionRequest,
  TransferFundsRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { VeriffHookRequest, WebhookResponse } from '~common/grpc/interfaces/veriff';
import { MakeDepositRequest } from '../interfaces/payment-gateway.interface';
import { CurrencyService } from './currency.service';
import { PrimeTrustService } from './prime_trust/prime-trust.service';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private userService: UserService,
    private primeTrustService: PrimeTrustService,
    private readonly currencyService: CurrencyService,
  ) {}

  async getToken(): Promise<PG_Token> {
    const token = await this.primeTrustService.getToken();

    return { data: token };
  }

  async createAccount(id: number): Promise<AccountResponse> {
    const userDetails = await this.userService.getUserInfo(id);

    return this.primeTrustService.createAccount(userDetails);
  }

  createAgreement(request: AgreementRequest): Promise<UserAgreement> {
    return this.primeTrustService.createAgreement(request);
  }
  async getBalance({ user_id, currencies }: BalanceRequest): Promise<BalanceResponse> {
    const balance = await this.primeTrustService.getBalance(user_id);
    const resp: BalanceResponse = { ...balance, conversions: [] };

    if (currencies.length) {
      const conversions = await this.currencyService.convert(parseFloat(balance.settled), currencies);
      for (const curr in conversions) {
        if (Object.prototype.hasOwnProperty.call(conversions, curr)) {
          resp.conversions.push({
            currency: curr,
            amount: conversions[curr]['amount'],
            rate: conversions[curr]['rate'],
          });
        }
      }
    }

    return resp;
  }

  createCreditCardResource(userId: number) {
    return this.primeTrustService.createCreditCardResource(userId);
  }

  verifyCreditCard(request: VerifyCreditCardRequest) {
    const { resource_id, transfer_method_id } = request;

    return this.primeTrustService.verifyCreditCard(resource_id, transfer_method_id);
  }

  transferFunds(request: TransferFundsRequest) {
    return this.primeTrustService.transferFunds(request);
  }

  getContact(id: number) {
    return this.primeTrustService.getContact(id);
  }
  getTransactions(request: SearchTransactionRequest) {
    return this.primeTrustService.getTransactions(request);
  }

  getDepositParams(request: UserIdRequest) {
    return this.primeTrustService.getDepositParams(request.id);
  }

  makeDeposit(request: MakeDepositRequest) {
    return this.primeTrustService.makeDeposit(request);
  }

  getUserAccountStatus(request: IdRequest) {
    return this.primeTrustService.getUserAccountStatus(request);
  }

  transferToHotWallet() {
    return this.primeTrustService.transferToHotWallet();
  }

  async exchange({ currencies, currency_type }: ExchangeRequest): Promise<ExchangeResponse> {
    const resp: ExchangeResponse = { currency_type, conversions: [] };

    const rates = await this.currencyService.rates(currency_type, ...currencies);

    for (const curr in rates) {
      if (Object.prototype.hasOwnProperty.call(rates, curr)) {
        resp.conversions.push({
          currency: curr,
          rate: rates[curr],
        });
      }
    }

    return resp;
  }

  generateVeriffLink(id: number) {
    return this.primeTrustService.generateVeriffLink(id);
  }

  veriffHookHandler(request: VeriffHookRequest) {
    return this.primeTrustService.veriffHookHandler(request);
  }

  async veriffWebhookHandler(request: WebhookResponse): Promise<SuccessResponse> {
    const { success, user_id } = await this.primeTrustService.veriffWebhookHandler(request);
    if (success) {
      await this.createAccount(user_id);
    }

    return { success };
  }

  linkSession({ id }: UserIdRequest) {
    return this.primeTrustService.linkSession(id);
  }

  saveCustomer(request: LinkCustomerRequest) {
    return this.primeTrustService.saveCustomer(request);
  }
}
