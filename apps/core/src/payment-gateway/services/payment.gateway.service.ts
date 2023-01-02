import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  PaymentGatewayListQuery,
  PaymentGatewayListResponse,
  PG_Token,
  TokenSendRequest,
  TransferMethodRequest,
  UploadDocumentRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { PaymentGatewayEntity } from '~svc/core/src/payment-gateway/entities/payment-gateway.entity';
import { UserService } from '~svc/core/src/user/services/user.service';
import { PaymentGatewayManager } from '../manager/payment-gateway.manager';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

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
    const token = await paymentGateway.getToken(details);

    return { data: token };
  }

  async createUser(id: number): Promise<boolean> {
    try {
      const user = await this.userService.getUserInfo(id);
      const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
        user.country.payment_gateway.alias,
      );
      await paymentGateway.createUser(user);
    } catch (error) {
      this.logger.error('Payment gateway create user: failed', error.stack, { id, error });

      return false;
    }

    return true;
  }

  async createAccount(payload: TokenSendRequest): Promise<SuccessResponse> {
    const { id, token } = payload;
    const userDetails = await this.userService.getUserInfo(id);

    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createAccount(userDetails, token);
  }

  async createContact(payload: TokenSendRequest): Promise<SuccessResponse> {
    const { id, token } = payload;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createContact(userDetails, token);
  }

  async uploadDocument(request: UploadDocumentRequest): Promise<SuccessResponse> {
    const {
      file,
      label,
      tokenData: { id, token },
    } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.uploadDocument(userDetails, file, label, token);
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

  async createReference(request: TokenSendRequest) {
    const { id, token } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return paymentGateway.createReference(userDetails, token);
  }

  async updateBalance(request: AccountIdRequest) {
    const { payment_gateway, id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.updateAccountBalance(id);
  }

  async getBalance(request: TokenSendRequest) {
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
    const { payment_gateway, id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.updateWithdraw(id);
  }
}
