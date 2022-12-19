import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '~svc/core/src/user/services/user.service';
import { GetTokenRequest } from '~common/grpc/interfaces/prime_trust';
import { PaymentGatewayManager } from '../manager/payment.gateway.manager';
import { HttpService } from '@nestjs/axios';
import { CreateRequestDto } from '~svc/core/src/user/dto/create.request.dto';
import { generatePassword } from '~common/helpers';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(UserService)
    private userService: UserService,

    @Inject(PaymentGatewayManager)
    private paymentGatewayManager: PaymentGatewayManager,
  ) {}

  async getToken(request: GetTokenRequest) {
    const { user_id } = request;
    const user = await this.userService.get(user_id);
    const details = await this.userService.getUserInfo(user);
    const paymentGateway = await this.paymentGatewayManager.callApiGatewayService(
      details.country.payment_gateway.alias,
    );
    const token = await paymentGateway.getToken(user.email);

    return { data: token };
  }

  async createUser(payload: CreateRequestDto) {
    const { username, email } = payload;
    const user = await this.userService.create(payload);
    const details = await this.userService.getUserInfo(user);
    const paymentGateway = await this.paymentGatewayManager.callApiGatewayService(
      details.country.payment_gateway.alias,
    );
    const pg_password = generatePassword(true, true, 16);
    const payment_gateway_user = await paymentGateway.createUserInDB({
      name: username,
      password: pg_password,
      email,
      user_id: user.id,
    });
    await paymentGateway.createUser(payment_gateway_user);

    return user;
  }
}
