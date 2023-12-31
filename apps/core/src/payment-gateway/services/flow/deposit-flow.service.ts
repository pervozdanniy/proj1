import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepositFlowResponse, DepositNextStepRequest, TransferInfo } from '~common/grpc/interfaces/payment-gateway';
import { UserService } from '~svc/core/src/user/services/user.service';
import { DepositFlowEntity, DepositResourceType } from '../../entities/flow/deposit.entity';
import { CardResourceEntity } from '../../entities/prime_trust/card-resource.entity';
import { PaymentMethod } from '../../interfaces/payment-gateway.interface';
import {
  hasBank,
  hasBankDeposit,
  hasCash,
  hasCreditCard,
  hasDeposit,
  hasRedirectDeposit,
  hasWireTransfer,
  PaymentGatewayManager,
} from '../../manager/payment-gateway.manager';
import { PrimeLinkManager } from '../prime_trust/managers/prime-link-manager';

@Injectable()
export class DepositFlow {
  constructor(
    private userService: UserService,
    private paymentGatewayManager: PaymentGatewayManager,
    private primeLinkManager: PrimeLinkManager,
    @InjectRepository(DepositFlowEntity)
    private depositFlowRepo: Repository<DepositFlowEntity>,
    @InjectRepository(CardResourceEntity)
    private cardsRepo: Repository<CardResourceEntity>,
  ) {}

  async start(payload: {
    amount: number;
    currency: string;
    user_id: number;
    type?: PaymentMethod;
  }): Promise<DepositFlowResponse> {
    const userDetails = await this.userService.getUserInfo(payload.user_id);
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(userDetails.country_code);

    if (payload.type === 'credit-card' && hasCreditCard(paymentGateway)) {
      const { identifiers } = await this.depositFlowRepo.insert({
        user_id: payload.user_id,
        currency: payload.currency,
        amount: payload.amount,
        country_code: userDetails.country_code,
        resource_type: DepositResourceType.Card,
      });
      const { data } = await paymentGateway.getCreditCards(payload.user_id);

      return {
        flow_id: identifiers[0].id,
        action: 'select-card',
        cards: { list: data },
      };
    }

    if (hasWireTransfer(paymentGateway) && payload.type === 'bank-transfer') {
      const { bank, info } = await paymentGateway.createWireReference({
        user_id: userDetails.id,
        amount_usd: payload.amount,
        currency_type: payload.currency,
      });

      return {
        action: 'pay_with_bank',
        bank_params: {
          bank,
          info,
        },
      };
    }

    if (payload.type === 'bank-transfer' && hasBank(paymentGateway)) {
      if (hasBankDeposit(paymentGateway)) {
        const { identifiers } = await this.depositFlowRepo.insert({
          user_id: payload.user_id,
          currency: payload.currency,
          amount: payload.amount,
          country_code: userDetails.country_code,
          resource_type: DepositResourceType.Bank,
        });
        const session = await this.primeLinkManager.linkSession(payload.user_id);

        return {
          action: 'link_transfer',
          flow_id: identifiers[0].id,
          link_transfer: { sessionKey: session.sessionKey },
        };
      }

      if (hasRedirectDeposit(paymentGateway)) {
        const { url, info } = await paymentGateway.createRedirectReference({
          user_id: userDetails.id,
          amount_usd: payload.amount,
          currency_type: payload.currency,
        });

        return {
          action: 'redirect',
          redirect: {
            url,
            info,
          },
        };
      }
    }

    if (payload.type === 'cash' && hasCash(paymentGateway)) {
      if (hasRedirectDeposit(paymentGateway)) {
        const redirect = await paymentGateway.createRedirectReference({
          user_id: userDetails.id,
          amount_usd: payload.amount,
          currency_type: payload.currency,
        });

        return {
          action: 'redirect',
          redirect,
        };
      }
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }

  async payWithSelectedResource(payload: DepositNextStepRequest): Promise<TransferInfo> {
    const flow = await this.depositFlowRepo.findOneByOrFail({ id: payload.id });
    if (flow.user_id !== payload.user_id) {
      throw new ForbiddenException();
    }
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(flow.country_code);
    if (!hasDeposit(paymentGateway)) {
      throw new UnauthorizedException('This operation is not permitted in your country');
    }

    if (flow.resource_type === DepositResourceType.Bank && hasBankDeposit(paymentGateway)) {
      const payment = await this.primeLinkManager.makeDeposit(
        payload.user_id,
        payload.customer.id,
        flow.amount,
        flow.currency,
      );
      if (payment.paymentStatus === 'terminal_failed') {
        throw new ConflictException('Payment failed,not enough money on account!');
      }

      if (payment.paymentStatus === 'failed') {
        throw new ConflictException('Payment failed!');
      }
      await this.depositFlowRepo.delete(payload.id);

      return {
        amount: flow.amount,
        currency: flow.currency,
        fee: 0,
      };
    }

    if (flow.resource_type === DepositResourceType.Card && hasCreditCard(paymentGateway)) {
      const card = await this.cardsRepo.findOneBy({ id: payload.card.id });
      const transferInfo = await paymentGateway.makeDeposit({
        id: flow.user_id,
        funds_transfer_method_id: card.transfer_method_id,
        amount: flow.amount,
        cvv: payload.card.cvv,
      });
      await this.depositFlowRepo.delete(payload.id);

      return transferInfo;
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }
}
