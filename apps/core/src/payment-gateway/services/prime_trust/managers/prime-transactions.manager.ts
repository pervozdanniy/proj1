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

    queryBuilder.select(['t.*', 's.last_name', 's.first_name', 'r.last_name', 'r.first_name']).orderBy('t.id', 'DESC');

    const transactions = await queryBuilder.limit(limit + 1).getRawMany();

    transactions.forEach((t) => {
      if (t.type === 'transfer') {
        if (t.user_id === user_id) {
          t.title = `Outgoing transfer to ${t.r_first_name} ${t.r_last_name}`;
          t.type = 'outgoing_transfer';
        } else {
          t.title = `Incoming transfer from ${t.s_first_name} ${t.s_last_name}`;
          t.type = 'incoming_transfer';
        }
        t.name = `${t.r_first_name} ${t.r_last_name}`;
      } else if (t.type === 'deposit') {
        t.title = 'Deposit action';
      } else if (t.type === 'withdrawal') {
        t.title = 'Withdrawal action';
      } else {
        t.title = t.type;
      }
    });

    let has_more = false;

    if (transactions.length > limit) {
      has_more = true;
      transactions.splice(-1);
    }

    const { id: last_id } = transactions.at(-1);

    return {
      last_id,
      transactions,
      has_more,
    };
  }
}
