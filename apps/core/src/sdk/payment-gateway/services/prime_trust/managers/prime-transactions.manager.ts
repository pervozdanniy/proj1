import { NotificationService } from '@/notification/services/notification.service';
import { ContributionEntity } from '@/sdk/payment-gateway/entities/prime_trust/contribution.entity';
import { DepositParamsEntity } from '@/sdk/payment-gateway/entities/prime_trust/deposit-params.entity';
import { WithdrawalParamsEntity } from '@/sdk/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '@/sdk/payment-gateway/entities/prime_trust/withdrawal.entity';
import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionResponse } from '~common/grpc/interfaces/payment-gateway';
import { TransfersEntity } from '../../../entities/prime_trust/transfers.entity';

@Injectable()
export class PrimeTransactionsManager {
  constructor(
    private readonly notificationService: NotificationService,

    @InjectRepository(ContributionEntity)
    private readonly contributionEntityRepository: Repository<ContributionEntity>,

    @InjectRepository(DepositParamsEntity)
    private readonly depositParamsEntityRepository: Repository<DepositParamsEntity>,

    @InjectRepository(TransfersEntity)
    private readonly transferFundsEntityRepository: Repository<TransfersEntity>,

    @InjectRepository(WithdrawalEntity)
    private readonly withdrawalEntityRepository: Repository<WithdrawalEntity>,

    @InjectRepository(WithdrawalParamsEntity)
    private readonly withdrawalParamsEntityRepository: Repository<WithdrawalParamsEntity>,
  ) {}

  async getTransactions(id: number): Promise<TransactionResponse> {
    const transfers = await this.transferFundsEntityRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect(UserDetailsEntity, 's', 's.user_id = t.user_id')
      .leftJoinAndSelect(UserDetailsEntity, 'r', 'r.user_id = t.receiver_id')
      .where('t.user_id = :id', { id })
      .orWhere('t.receiver_id = :id', { id })
      .select([
        't.*',
        `CASE
          WHEN t.type = 'transfer' AND t.user_id = ${id} THEN 'to ' || r.first_name || ' ' || r.last_name
          WHEN t.type = 'transfer' THEN 'from ' || s.first_name || ' ' || s.last_name
          ELSE t.type
        END as title`,
      ])
      .getRawMany();

    return {
      data: transfers,
    };
  }
}
