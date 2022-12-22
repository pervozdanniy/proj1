import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateAccountRequest, PG_Token } from '~common/grpc/interfaces/payment-gateway';
import { SuccessResponse } from '~common/grpc/interfaces/prime_trust';
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

  async createAccount(payload: CreateAccountRequest): Promise<SuccessResponse> {
    const { id, token } = payload;
    const userDetails = await this.userService.getUserInfo(id);

    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    const accountResponse = await paymentGateway.getAccountData(userDetails, token);

    return await paymentGateway.createAccount(accountResponse.data, userDetails.id);
  }
}
