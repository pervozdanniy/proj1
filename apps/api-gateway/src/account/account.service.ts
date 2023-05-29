import { Injectable } from '@nestjs/common';
import { SearchTransactionRequest } from '~common/grpc/interfaces/payment-gateway';
import { ExternalBalanceService } from '../payment-gateway/services/external-balance.service';
import { PaymentGatewayService } from '../payment-gateway/services/payment-gateway.service';
import { UserService } from '../user/services/user.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly user: UserService,
    private readonly paymentGateway: PaymentGatewayService,
    private readonly external: ExternalBalanceService,
  ) {}

  balance(userId: number, currencies?: string[]) {
    return this.paymentGateway.getBalance(userId, currencies);
  }

  externalBalance(userId: number) {
    return this.external.getBalance(userId);
  }

  async transactions(request: SearchTransactionRequest) {
    const response = await this.paymentGateway.getTransactions(request);

    return {
      ...response,
      transactions: response.transactions.map((t) => ({
        ...t,
        participant: t.participant ? this.user.withAvatarUrl(t.participant) : null,
      })),
    };
  }
}
