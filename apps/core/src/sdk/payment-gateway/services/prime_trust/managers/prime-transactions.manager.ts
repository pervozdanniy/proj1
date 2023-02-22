import { NotificationService } from '@/notification/services/notification.service';
import { ContributionEntity } from '@/sdk/payment-gateway/entities/prime_trust/contribution.entity';
import { DepositParamsEntity } from '@/sdk/payment-gateway/entities/prime_trust/deposit-params.entity';
import { TransfersEntity } from '@/sdk/payment-gateway/entities/prime_trust/transfers.entity';
import { WithdrawalParamsEntity } from '@/sdk/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '@/sdk/payment-gateway/entities/prime_trust/withdrawal.entity';
import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SearchTransactionRequest, TransactionResponse } from '~common/grpc/interfaces/payment-gateway';

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

  async getTransactions(request: SearchTransactionRequest): Promise<TransactionResponse> {
    const { user_id, searchTerm, searchAfter, limit } = request;

    const queryBuilder = this.transferFundsEntityRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect(UserDetailsEntity, 's', 's.user_id = t.user_id')
      .leftJoinAndSelect(UserDetailsEntity, 'r', 'r.user_id = t.receiver_id')
      .leftJoinAndSelect(UserEntity, 'sender_details', 'sender_details.id = t.user_id')
      .leftJoinAndSelect(UserEntity, 'receiver_details', 'receiver_details.id = t.receiver_id');

    if (searchAfter) {
      queryBuilder.where('t.id < :searchAfter', { searchAfter });
    }

    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where('t.user_id = :user_id', { user_id }).orWhere('t.receiver_id = :user_id', { user_id });
      }),
    );

    if (searchTerm) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('sender_details.email ILIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
            .orWhere('receiver_details.email ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('sender_details.phone ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('receiver_details.phone ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('s.first_name ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('s.last_name ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('r.first_name ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('r.last_name ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            });
        }),
      );
    }

    queryBuilder
      .select([
        't.*',
        `CASE
        WHEN t.type = 'transfer' AND t.user_id = ${user_id} THEN 'to ' || r.first_name || ' ' || r.last_name
        WHEN t.type = 'transfer' THEN 'from ' || s.first_name || ' ' || s.last_name
        ELSE t.type
      END as title`,
      ])
      .orderBy('t.created_at', 'DESC');

    const transactions = await queryBuilder.limit(limit).getRawMany();

    if (transactions.length === 0) {
      return { transactions, hasMore: false };
    }

    const { id: lastId } = transactions.at(-1);

    return {
      lastId,
      transactions,
      hasMore: lastId > 1,
    };
  }
}
