import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SearchTransactionRequest, TransactionResponse } from '~common/grpc/interfaces/payment-gateway';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';

@Injectable()
export class PrimeTransactionsManager {
  constructor(
    @InjectRepository(TransfersEntity)
    private readonly transferFundsEntityRepository: Repository<TransfersEntity>,
  ) {}

  async getTransactions(request: SearchTransactionRequest): Promise<TransactionResponse> {
    const { user_id, search_after, search_term, limit } = request;

    const queryBuilder = this.transferFundsEntityRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect(UserDetailsEntity, 's', 's.user_id = t.user_id')
      .leftJoinAndSelect(UserDetailsEntity, 'r', 'r.user_id = t.receiver_id')
      .leftJoinAndSelect(UserEntity, 'sender_details', 'sender_details.id = t.user_id')
      .leftJoinAndSelect(UserEntity, 'receiver_details', 'receiver_details.id = t.receiver_id');

    if (search_after) {
      queryBuilder.where('t.id < :search_after', { search_after });
    }

    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where('t.user_id = :user_id', { user_id }).orWhere('t.receiver_id = :user_id', { user_id });
      }),
    );

    if (search_term) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('sender_details.email ILIKE :search_term', {
            search_term: `%${search_term}%`,
          })
            .orWhere('receiver_details.email ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('sender_details.phone ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('receiver_details.phone ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('s.first_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('s.last_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('r.first_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('r.last_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            });
        }),
      );
    }

    queryBuilder
      .select([
        't.*',
        `CASE 
          WHEN t.type = 'transfer' THEN 
            CASE 
              WHEN t.user_id = ${user_id} THEN 'Outgoing transfer to ' || r.first_name || ' ' || r.last_name
              ELSE 'Incoming transfer from ' || s.first_name || ' ' || s.last_name
            END 
          WHEN t.type = 'deposit' THEN 'Deposit action'
          WHEN t.type = 'withdrawal' THEN 'Withdrawal action'
          ELSE t.type
        END as title`,
        `CASE 
          WHEN t.type = 'transfer' THEN 
            CASE 
              WHEN t.user_id = ${user_id} THEN 'outgoing_transfer'
              ELSE 'incoming_transfer'
            END 
          ELSE t.type
        END as type`,
      ])
      .orderBy('t.created_at', 'DESC');

    const transactions = await queryBuilder.limit(limit).getRawMany();

    if (transactions.length === 0) {
      return { transactions, has_more: false };
    }

    const { id: last_id } = transactions.at(-1);

    return {
      last_id,
      transactions,
      has_more: last_id > 1,
    };
  }
}
