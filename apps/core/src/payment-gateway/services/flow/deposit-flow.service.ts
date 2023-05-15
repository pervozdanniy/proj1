import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepositNextStepRequest } from '~common/grpc/interfaces/payment-gateway';
import { UserService } from '~svc/core/src/user/services/user.service';
import { DepositFlowEntity, DepositResourceType } from '../../entities/flow/deposit.entity';
import { CardResourceEntity } from '../../entities/prime_trust/card-resource.entity';
import { PaymentMethod } from '../../interfaces/payment-gateway.interface';
import {
  hasBankDeposit,
  hasCash,
  hasCreditCard,
  hasDeposit,
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

  async start(payload: { amount: string; currency: string; user_id: number; type: PaymentMethod }) {
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

    if (payload.type === 'bank-transfer') {
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
    }

    if (payload.type === 'cash') {
      if (hasCash(paymentGateway)) {
        const resp = await paymentGateway.createReference({
          id: userDetails.id,
          amount: payload.amount,
          currency_type: payload.currency,
          type: 'cash',
        });

        return {
          action: 'redirect',
          redirect: { url: resp.data },
        };
      }
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }

  async payWithSelectedResource(payload: DepositNextStepRequest) {
    const flow = await this.depositFlowRepo.findOneByOrFail({ id: payload.id });
    if (flow.user_id !== payload.user_id) {
      throw new ForbiddenException();
    }
    const paymentGateway = this.paymentGatewayManager.createApiGatewayService(flow.country_code);
    if (!hasDeposit(paymentGateway)) {
      throw new UnauthorizedException('This operation is not permitted in your country');
    }

    if (flow.resource_type === DepositResourceType.Bank && hasBankDeposit(paymentGateway)) {
      const link_transfer = await this.primeLinkManager.sendAmount(payload.customer.id, flow.amount, flow.currency);
      await this.depositFlowRepo.delete(payload.id);

      return {
        contribution_id: link_transfer.paymentId,
      };
    }

    if (flow.resource_type === DepositResourceType.Card && hasCreditCard(paymentGateway)) {
      const card = await this.cardsRepo.findOneBy({ id: payload.card.id });
      const depositData = await paymentGateway.makeDeposit({
        id: flow.user_id,
        funds_transfer_method_id: card.transfer_method_id,
        amount: flow.amount,
        cvv: payload.card.cvv,
      });
      await this.depositFlowRepo.delete(payload.id);

      return depositData;
    }

    throw new UnauthorizedException('This operation is not permitted in your country');
  }
}
