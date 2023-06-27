import { UserService } from '@/user/services/user.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TransferInfo,
  WithdrawFlowRequest,
  WithdrawFlowResponse,
  WithdrawNextStepRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { DepositFlowEntity, DepositResourceType } from '../../entities/flow/deposit.entity';
import { BankAccountEntity } from '../../entities/prime_trust/bank-account.entity';
import { hasBank, hasWithdrawal, PaymentGatewayManager } from '../../manager/payment-gateway.manager';

export class WithdrawFlowService {
  constructor(
    private userService: UserService,
    private paymentGatewayManager: PaymentGatewayManager,
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountEntityRepository: Repository<BankAccountEntity>,
    @InjectRepository(DepositFlowEntity)
    private depositFlowRepo: Repository<DepositFlowEntity>,
  ) {}

  async start(payload: WithdrawFlowRequest): Promise<WithdrawFlowResponse> {
    const userDetails = await this.userService.getUserInfo(payload.user_id);
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);

    if (hasBank(paymentGateway) && payload.type === 'bank-transfer') {
      const { identifiers } = await this.depositFlowRepo.insert({
        user_id: payload.user_id,
        currency: payload.currency,
        amount: payload.amount,
        country_code: userDetails.country_code,
        resource_type: DepositResourceType.Bank,
      });
      const banks = await this.bankAccountEntityRepository.findBy({ user_id: userDetails.id });

      return {
        flow_id: identifiers[0].id,
        action: 'select_bank',
        banks: {
          list: banks,
        },
      };
    }
  }

  async pay(payload: WithdrawNextStepRequest): Promise<TransferInfo> {
    const flow = await this.depositFlowRepo.findOneByOrFail({ id: payload.id });
    if (flow.user_id !== payload.user_id) {
      throw new ForbiddenException();
    }
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(flow.country_code);
    if (!hasWithdrawal(paymentGateway)) {
      throw new UnauthorizedException('This operation is not permitted in your country');
    }

    if (flow.resource_type === DepositResourceType.Bank && hasBank(paymentGateway)) {
      return paymentGateway.makeWithdrawal({
        id: flow.user_id,
        bank_account_id: payload.bank.id,
        funds_transfer_type: payload.bank.transfer_type,
        amount: flow.amount,
      });
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }
}
