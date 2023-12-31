import { UserService } from '@/user/services/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BankAccountParams, TransferMethodRequest, UserIdRequest } from '~common/grpc/interfaces/payment-gateway';
import { hasBank, hasWithdrawal, PaymentGatewayManager } from '../manager/payment-gateway.manager';

@Injectable()
export class MainService {
  constructor(private userService: UserService, private paymentGatewayManager: PaymentGatewayManager) {}

  async getPaymentGateway(userId: number) {
    const userDetails = await this.userService.getUserInfo(userId);

    return this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);
  }

  async getAvailablePaymentMethods(id: number) {
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);

    return { methods: paymentGateway.getAvailablePaymentMethods() };
  }

  async getBanksInfo(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);
    if (hasBank(paymentGateway)) {
      return paymentGateway.getAvailableBanks(userDetails.country_code);
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }

  async addBankAccountParams(request: BankAccountParams) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);

    if (hasBank(paymentGateway)) {
      return paymentGateway.addBank(request);
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }

  async makeWithdrawal(request: TransferMethodRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);
    if (hasWithdrawal(paymentGateway)) {
      return paymentGateway.makeWithdrawal(request);
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }
}
