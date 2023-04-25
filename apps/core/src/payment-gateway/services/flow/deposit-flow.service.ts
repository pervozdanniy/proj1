import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepositNextStepRequest } from '~common/grpc/interfaces/payment-gateway';
import { UserService } from '~svc/core/src/user/services/user.service';
import { DepositFlowEntity } from '../../entities/flow/deposit.entity';
import { BankAccountEntity } from '../../entities/prime_trust/bank-account.entity';
import { hasBankDeposit, hasWireTransfer, PaymentGatewayManager } from '../../manager/payment-gateway.manager';

@Injectable()
export class DepositFlow {
  constructor(
    private userService: UserService,
    private paymentGatewayManager: PaymentGatewayManager,
    @InjectRepository(DepositFlowEntity)
    private depositFlowRepo: Repository<DepositFlowEntity>,
    @InjectRepository(BankAccountEntity)
    private banksRepo: Repository<BankAccountEntity>,
  ) {}

  async start(payload: { amount: string; currency: string; user_id: number }) {
    const userDetails = await this.userService.getUserInfo(payload.user_id);

    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);

    if (hasBankDeposit(paymentGateway)) {
      const { identifiers } = await this.depositFlowRepo.insert({
        user_id: payload.user_id,
        currency: payload.currency,
        amount: payload.amount,
        country_code: userDetails.country_code,
      });

      const banks = await this.banksRepo.findBy({ user_id: payload.user_id });

      return {
        id: identifiers[0].id,
        action: 'select-bank',
        select: { banks },
      };
    }

    if (hasWireTransfer(paymentGateway)) {
      const resp = await paymentGateway.createReference({
        id: userDetails.id,
        amount: payload.amount,
        currency_type: payload.currency,
        type: 'wire',
      });

      return {
        action: 'redirect',
        redirect: { url: resp.data },
      };
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }

  async selectBank(payload: DepositNextStepRequest) {
    const flow = await this.depositFlowRepo.findOneByOrFail({ id: payload.id });
    if (flow.user_id !== payload.user_id) {
      throw new ForbiddenException();
    }
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(flow.country_code);
    if (hasBankDeposit(paymentGateway)) {
      const resp = await paymentGateway.setDepositParams({
        id: flow.user_id,
        bank_account_id: payload.select.bank_id,
        funds_transfer_type: payload.select.transfer_type,
      });
      const depositData = await paymentGateway.makeDeposit({
        id: flow.user_id,
        funds_transfer_method_id: resp.transfer_method_id,
        amount: flow.amount,
      });
      await this.depositFlowRepo.delete(payload.id);

      return depositData;
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }
}
