import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '~svc/core/src/user/services/user.service';
import { GetTokenRequest } from '~common/grpc/interfaces/prime_trust';
import { PaymentGatewayManager } from '../manager/payment.gateway.manager';
import { HttpService } from '@nestjs/axios';

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
    const paymentGateway = await this.userService.getPaymentGatewayByUser(user);
    const token = await paymentGateway.getToken(user.email);

    return { data: token };
  }
}
