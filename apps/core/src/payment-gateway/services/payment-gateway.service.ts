import { UserService } from '@/user/services/user.service';
import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountResponse,
  BankAccountParams,
  CreateReferenceRequest,
  DepositParamRequest,
  DocumentResponse,
  MakeContributionRequest,
  PG_Token,
  SearchTransactionRequest,
  TransferFundsRequest,
  TransferMethodRequest,
  UploadDocumentRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { PaymentGatewayManager } from '../manager/payment-gateway.manager';
import { PrimeTrustService } from './prime_trust/prime-trust.service';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private userService: UserService,

    private paymentGatewayManager: PaymentGatewayManager,

    private primeTrustService: PrimeTrustService,
  ) {}

  async getToken(): Promise<PG_Token> {
    const token = await this.primeTrustService.getToken();

    return { data: token };
  }

  async getAvailablePaymentMethods(id: number) {
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return { methods: await paymentGateway.getAvailablePaymentMethods() };
  }

  async createAccount(id: number): Promise<AccountResponse> {
    const userDetails = await this.userService.getUserInfo(id);

    return this.primeTrustService.createAccount(userDetails);
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

  async getBalance(id: number) {
    return this.primeTrustService.getBalance(id);
  }

  async getWithdrawalParams(id: number) {
    return this.primeTrustService.getWithdrawalParams(id);
  }

  async createCreditCardResource(id: number) {
    return this.primeTrustService.createCreditCardResource(id);
  }

  async verifyCreditCard(request: VerifyCreditCardRequest) {
    const { resource_id } = request;

    return this.primeTrustService.verifyCreditCard(resource_id);
  }

  async getCreditCards(id: number) {
    return this.primeTrustService.getCreditCards(id);
  }

  async transferFunds(request: TransferFundsRequest) {
    return this.primeTrustService.transferFunds(request);
  }

  async getAccount(id: number) {
    return this.primeTrustService.getAccount(id);
  }

  async getContact(id: number) {
    return this.primeTrustService.getContact(id);
  }

  async getDepositById(request: UserIdRequest) {
    return this.primeTrustService.getDepositById(request);
  }
  async getTransactions(request: SearchTransactionRequest) {
    return this.primeTrustService.getTransactions(request);
  }

  async getDepositParams(request: UserIdRequest) {
    return this.primeTrustService.getDepositParams(request.id);
  }

  async getWithdrawalById(request: UserIdRequest) {
    return this.primeTrustService.getWithdrawalById(request);
  }

  async addDepositParams(request: DepositParamRequest) {
    return this.primeTrustService.addDepositParams(request);
  }

  async makeContribution(request: MakeContributionRequest) {
    return this.primeTrustService.makeContribution(request);
  }

  async addWithdrawalParams(request: WithdrawalParams) {
    return this.primeTrustService.addWithdrawalParams(request);
  }

  async getBankAccounts(request: UserIdRequest) {
    return this.primeTrustService.getBankAccounts(request.id);
  }

  async addBankAccountParams(request: BankAccountParams) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return paymentGateway.addBankAccountParams(request);
  }

  async createReference(request: CreateReferenceRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return paymentGateway.createReference(request);
  }

  async makeWithdrawal(request: TransferMethodRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return paymentGateway.makeWithdrawal(request);
  }
}