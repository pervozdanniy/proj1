import { UserService } from '@/user/services/user.service';
import { Injectable } from '@nestjs/common';
import { IdRequest, SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import {
  AccountResponse,
  AgreementRequest,
  BalanceRequest,
  BalanceResponse,
  DepositParamRequest,
  DocumentResponse,
  MakeDepositRequest,
  PG_Token,
  SearchTransactionRequest,
  TransferFundsRequest,
  UploadDocumentRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
} from '~common/grpc/interfaces/payment-gateway';
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

  async createContact(id: number): Promise<SuccessResponse> {
    const userDetails = await this.userService.getUserInfo(id);

    return this.primeTrustService.createContact(userDetails);
  }

  async uploadDocument(request: UploadDocumentRequest): Promise<DocumentResponse> {
    const {
      file,
      label,
      userId: { id },
    } = request;
    const userDetails = await this.userService.getUserInfo(id);

    return this.primeTrustService.uploadDocument(userDetails, file, label);
  }

  async getBalance({ user_id, currencies }: BalanceRequest): Promise<BalanceResponse> {
    const balance = await this.primeTrustService.getBalance(user_id);
    const resp: BalanceResponse = { ...balance, conversions: [] };

    if (currencies.length) {
      const conversions = await this.currencyService.convert(
        parseFloat(balance.settled),
        balance.currency_type,
        ...currencies,
      );
      for (const curr in conversions) {
        if (Object.prototype.hasOwnProperty.call(conversions, curr)) {
          resp.conversions.push({ currency: curr, amount: conversions[curr].toFixed(2) });
        }
      }
    }

    return resp;
  }

  createCreditCardResource(id: number) {
    return this.primeTrustService.createCreditCardResource(id);
  }

  verifyCreditCard(request: VerifyCreditCardRequest) {
    const { resource_id } = request;

    return this.primeTrustService.verifyCreditCard(resource_id);
  }

  getCreditCards(id: number) {
    return this.primeTrustService.getCreditCards(id);
  }

  transferFunds(request: TransferFundsRequest) {
    return this.primeTrustService.transferFunds(request);
  }

  getAccount(id: number) {
    return this.primeTrustService.getAccount(id);
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

  addDepositParams(request: DepositParamRequest) {
    return this.primeTrustService.addDepositParams(request);
  }

  makeDeposit(request: MakeDepositRequest) {
    return this.primeTrustService.makeDeposit(request);
  }

  async getBankAccounts(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);

    return this.primeTrustService.getBankAccounts(request.id, userDetails.country_code);
  }

  getUserAccountStatus(request: IdRequest) {
    return this.primeTrustService.getUserAccountStatus(request);
  }

  transferToHotWallet() {
    return this.primeTrustService.transferToHotWallet();
  }
}
