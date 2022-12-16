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
    // if (!keys[user.payment_gateway]) {
    //   throw new GRPCException(400, 'Current payment gateway not supported!', 400);
    // }
    // const payment_gateway = this.paymentGatewayManager.callApiGatewayService(user.payment_gateway);
    // const caller = paymentGatewayRunner(new keys[user.payment_gateway](this.httpService));
    // const pg_user = caller.createUser(request);
  }
}
