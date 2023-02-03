import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  PaymentGatewayListQuery,
  PaymentGatewayListResponse,
  PG_Token,
  TransferFundsRequest,
  TransferMethodRequest,
  UploadDocumentRequest,
  UserIdRequest,
  VerifyCreditCardRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { UserService } from '~svc/core/src/api/user/services/user.service';
import { PaymentGatewayEntity } from '~svc/core/src/sdk/payment-gateway/entities/payment-gateway.entity';
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

  async createAccount(payload: UserIdRequest): Promise<SuccessResponse> {
    const { id } = payload;
    const userDetails = await this.userService.getUserInfo(id);

    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createAccount(userDetails);
  }

  async createContact(payload: UserIdRequest): Promise<SuccessResponse> {
    const { id } = payload;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createContact(userDetails);
  }

  async uploadDocument(request: UploadDocumentRequest): Promise<SuccessResponse> {
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
    const { payment_gateway, id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.documentCheck(id);
  }

  async cipCheck(request: AccountIdRequest) {
    const { payment_gateway, id, resource_id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.cipCheck(id, resource_id);
  }

  async createReference(request: UserIdRequest) {
    const { id } = request;
    const userDetails = await this.userService.getUserInfo(id);
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
    const { id } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getBalance(id);
  }

  async addWithdrawalParams(request: WithdrawalParams) {
    const { id } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.addWithdrawalParams(request);
  }

  async makeWithdrawal(request: TransferMethodRequest) {
    const { id } = request;
    const userDetails = await this.userService.getUserInfo(id);
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
    const { payment_gateway } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.updateContribution(request);
  }

  async getWithdrawalParams(request: UserIdRequest) {
    const { id } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getWithdrawalParams(id);
  }

  async createCreditCardResource(request: UserIdRequest) {
    const { id } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createCreditCardResource(id);
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
    const { id } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.getCreditCards(id);
  }

  async transferFunds(request: TransferFundsRequest) {
    const { sender_id } = request;
    const userDetails = await this.userService.getUserInfo(sender_id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.transferFunds(request);
  }
}
