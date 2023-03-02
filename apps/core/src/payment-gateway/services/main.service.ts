import { UserService } from '@/user/services/user.service';
import { Injectable } from '@nestjs/common';
import {
  BankAccountParams,
  CreateReferenceRequest,
  TransferMethodRequest,
  UserIdRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { PaymentGatewayManager } from '../manager/payment-gateway.manager';

@Injectable()
export class MainService {
  constructor(
    private userService: UserService,

    private paymentGatewayManager: PaymentGatewayManager,
  ) {}

  async getAvailablePaymentMethods(id: number) {
    const userDetails = await this.userService.getUserInfo(id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return { methods: paymentGateway.getAvailablePaymentMethods() };
  }

  async getBanksInfo(request: UserIdRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return paymentGateway.getAvailableBanks(userDetails.country.code);
  }

  async addBankAccountParams(request: BankAccountParams) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return paymentGateway.addBank(request);
  }

  async createReference(request: CreateReferenceRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return paymentGateway.createReference(request);
  }

  async makeWithdrawal(request: TransferMethodRequest) {
    const userDetails = await this.userService.getUserInfo(request.id);
    const paymentGateway = await this.paymentGatewayManager.createApiGatewayService(userDetails.country.code);

    return paymentGateway.makeWithdrawal(request);
  }
}
