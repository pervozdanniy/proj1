import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionResponse } from '~common/grpc/interfaces/payment-gateway';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';
import { ContributionEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/contribution.entity';
import { DepositParamsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/deposit-params.entity';
import { TransferFundsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/transfer-funds.entity';
import { WithdrawalParamsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal.entity';

@Injectable()
export class PrimeTransactionsManager {
  constructor(
    private readonly notificationService: NotificationService,

    @InjectRepository(ContributionEntity)
    private readonly contributionEntityRepository: Repository<ContributionEntity>,

    @InjectRepository(DepositParamsEntity)
    private readonly depositParamsEntityRepository: Repository<DepositParamsEntity>,

    @InjectRepository(TransferFundsEntity)
    private readonly transferFundsEntityRepository: Repository<TransferFundsEntity>,

    @InjectRepository(WithdrawalEntity)
    private readonly withdrawalEntityRepository: Repository<WithdrawalEntity>,

    @InjectRepository(WithdrawalParamsEntity)
    private readonly withdrawalParamsEntityRepository: Repository<WithdrawalParamsEntity>,
  ) {}

  async getTransactions(id: number): Promise<TransactionResponse> {
    const transfers = await this.transferFundsEntityRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect(UserDetailsEntity, 's', 's.user_id = t.sender_id')
      .leftJoinAndSelect(UserDetailsEntity, 'r', 'r.user_id = t.receiver_id')
      .where('t.sender_id = :id', { id })
      .orWhere('t.receiver_id = :id', { id })
      .select([
        `CASE
          WHEN t.sender_id = ${id} THEN 'to ' || r.first_name || ' ' || r.last_name
          ELSE 'from ' || s.first_name || ' ' || s.last_name
        END as title`,
        `'/prime_trust/transfer/' as url`,
        `t.id as id`,
        `t.created_at as created_at`,
      ])
      .getRawMany();

    const deposits = await this.contributionEntityRepository
      .createQueryBuilder('c')
      .where('c.user_id = :id', { id })
      .select([`c.id as id`, `'deposit' as title`, `'/prime_trust/deposit/' as url`, `c.created_at as created_at`])
      .getRawMany();

    const withdrawals = await this.withdrawalEntityRepository
      .createQueryBuilder('w')
      .where('w.user_id = :id', { id })
      .select([
        `w.id as id`,
        `'withdrawal' as title`,
        `'/prime_trust/withdrawal/' as url`,
        `w.created_at as created_at`,
      ])
      .getRawMany();
    const fullData = [...transfers, ...deposits, ...withdrawals];
    fullData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      data: fullData,
    };
  }
}
