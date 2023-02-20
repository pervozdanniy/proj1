import { PaymentGatewayEntity } from '@/sdk/payment-gateway/entities/payment-gateway.entity';
import { UserService } from '@/user/services/user.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  AccountResponse,
  BankAccountParams,
  CreateWalledRequest,
  DepositParamRequest,
  DocumentResponse,
  MakeContributionRequest,
  PaymentGatewayListQuery,
  PaymentGatewayListResponse,
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

@Injectable()
export class PaymentGatewayService {
  constructor(
    @Inject(UserService)
    private userService: UserService,

    @Inject(PaymentGatewayManager)
    private paymentGatewayManager: PaymentGatewayManager,

    @InjectRepository(PaymentGatewayEntity)
    private readonly paymentGatewayEntityRepository: Repository<PaymentGatewayEntity>,
  ) {}

  async list(request: PaymentGatewayListQuery): Promise<PaymentGatewayListResponse> {
    const { offset, limit } = request;
    const [items, count] = await this.paymentGatewayEntityRepository
      .createQueryBuilder('u')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      count,
    };
  }

  async getToken(id: number): Promise<PG_Token> {
    const user = await this.userService.get(id);
    const details = await this.userService.getUserInfo(user.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      details.country.payment_gateway.alias,
    );
    const token = await paymentGateway.getToken();

    return { data: token };
  }

  async createAccount(payload: UserIdRequest): Promise<AccountResponse> {
    const { id } = payload;
    const userDetails = await this.userService.getUserInfo(id);

    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createAccount(userDetails);
  }

  async createContact(payload: UserIdRequest): Promise<SuccessResponse> {
    const userDetails = await this.userService.getUserInfo(payload.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createContact(userDetails);
  }

  async uploadDocument(request: UploadDocumentRequest): Promise<DocumentResponse> {
    const {
      file,
      label,
      userId: { id },
    } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.uploadDocument(userDetails, file, label);
  }

  async updateAccount(request: AccountIdRequest) {
    const { payment_gateway, id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.updateAccount(id);
  }

  async documentCheck(request: AccountIdRequest) {
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(request.payment_gateway);

    return paymentGateway.documentCheck(request);
  }

  async cipCheck(request: AccountIdRequest) {
    const { payment_gateway, id, resource_id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.cipCheck(id, resource_id);
  }

  async createReference(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createReference(userDetails);
  }

  async updateBalance(request: AccountIdRequest) {
    const { payment_gateway, id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.updateAccountBalance(id);
  }

  async getBalance(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getBalance(request.id);
  }

  async addWithdrawalParams(request: WithdrawalParams) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.addWithdrawalParams(request);
  }

  async makeWithdrawal(request: TransferMethodRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.makeWithdrawal(request);
  }

  async updateWithdraw(request: AccountIdRequest) {
    const { payment_gateway, resource_id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.updateWithdraw(resource_id);
  }

  async updateContribution(request: AccountIdRequest) {
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(request.payment_gateway);

    return paymentGateway.updateContribution(request);
  }

  async getWithdrawalParams(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getWithdrawalParams(request.id);
  }

  async createCreditCardResource(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createCreditCardResource(request.id);
  }

  async verifyCreditCard(request: VerifyCreditCardRequest) {
    const { id, resource_id } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.verifyCreditCard(resource_id);
  }

  async getCreditCards(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getCreditCards(request.id);
  }

  async transferFunds(request: TransferFundsRequest) {
    const userDetails = await this.userService.getUserInfo(request.sender_id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.transferFunds(request);
  }

  async addBankAccountParams(request: BankAccountParams) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.addBankAccountParams(request);
  }

  async getBankAccounts(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getBankAccounts(request.id);
  }

  async makeContribution(request: MakeContributionRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.makeContribution(request);
  }

  async getAccount(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getAccount(request.id);
  }

  async getContact(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getContact(request.id);
  }

  async addDepositParams(request: DepositParamRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.addDepositParams(request);
  }

  async getDepositById(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getDepositById(request);
  }
  async getTransactions(request: SearchTransactionRequest) {
    const userDetails = await this.userService.getUserInfo(request.user_id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getTransactions(request);
  }

  async getDepositParams(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getDepositParams(request.id);
  }

  async getWithdrawalById(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getWithdrawalById(request);
  }

  async createWallet(request: CreateWalledRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createWallet(request);
  }
}
