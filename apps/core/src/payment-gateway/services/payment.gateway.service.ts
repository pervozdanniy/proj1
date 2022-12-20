import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '~svc/core/src/user/services/user.service';
import { SuccessResponse } from '~common/grpc/interfaces/prime_trust';
import { PaymentGatewayManager } from '../manager/payment-gateway.manager';
import { HttpService } from '@nestjs/axios';
import { CreateRequestDto } from '~svc/core/src/user/dto/create-request.dto';
import { TokenSendRequest, PG_Token } from '~common/grpc/interfaces/payment-gateway';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { IdRequest } from '~common/grpc/interfaces/common';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(UserService)
    private userService: UserService,

    @Inject(PaymentGatewayManager)
    private paymentGatewayManager: PaymentGatewayManager,
  ) {}

  async getToken(request: IdRequest): Promise<PG_Token> {
    const { id } = request;
    const user = await this.userService.get(id);
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

  async createAccount(payload: TokenSendRequest): Promise<SuccessResponse> {
    const { id, token } = payload;
    const userDetails = await this.userService.getUserInfo(id);

    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return await paymentGateway.createAccount(userDetails, token);
  }

  async createContact(payload: TokenSendRequest): Promise<SuccessResponse> {
    const { id, token } = payload;
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(
      userDetails.country.payment_gateway.alias,
    );

    return await paymentGateway.createContact(userDetails, token);
  }
}
