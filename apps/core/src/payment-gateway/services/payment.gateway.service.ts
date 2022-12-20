import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '~svc/core/src/user/services/user.service';
import { SuccessResponse, UserIdRequest } from '~common/grpc/interfaces/prime_trust';
import { PaymentGatewayManager } from '../manager/payment.gateway.manager';
import { HttpService } from '@nestjs/axios';
import { CreateRequestDto } from '~svc/core/src/user/dto/create.request.dto';
import { CreateAccountRequest, PG_Token } from '~common/grpc/interfaces/payment-gateway';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(UserService)
    private userService: UserService,

    @Inject(PaymentGatewayManager)
    private paymentGatewayManager: PaymentGatewayManager,
  ) {}

  async getToken(request: UserIdRequest): Promise<PG_Token> {
    const { user_id } = request;
    const user = await this.userService.get(user_id);
    const details = await this.userService.getUserInfo(user.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      details.country.payment_gateway.alias,
    );
    const token = await paymentGateway.getToken(details);

    return { data: token };
  }

  async createUser(payload: CreateRequestDto): Promise<UserEntity> {
    const user = await this.userService.create(payload);
    const userInfo = await this.userService.getUserInfo(user.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userInfo.country.payment_gateway.alias,
    );
    await paymentGateway.createUser(userInfo);

    return user;
  }

  async createAccount(payload: CreateAccountRequest): Promise<SuccessResponse> {
    const { user_id, token } = payload;
    const userDetails = await this.userService.getUserInfo(user_id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    const accountResponse = await paymentGateway.getAccountData(userDetails, token);

    return await paymentGateway.createAccount(accountResponse.data, userDetails.prime_user.id);
  }
}
