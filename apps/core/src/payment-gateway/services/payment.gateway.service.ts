import { Inject, Injectable, Logger } from '@nestjs/common';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  PG_Token,
  TokenSendRequest,
  UpdateAccountRequest,
  UploadDocumentRequest,
} from '~common/grpc/interfaces/payment-gateway';
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
  ) {}

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

  async updateAccount(request: UpdateAccountRequest) {
    const { payment_gateway, status, id } = request;
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(payment_gateway);

    return paymentGateway.updateAccount(id, status);
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
}
