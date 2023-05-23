import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SearchTransactionRequest, Transaction, TransactionResponse } from '~common/grpc/interfaces/payment-gateway';
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
      .leftJoinAndMapOne('t.sender', UserDetailsEntity, 'sd', 'sd.user_id = t.user_id')
      .leftJoinAndMapOne('t.receiver', UserDetailsEntity, 'rd', 'rd.user_id = t.receiver_id')
      .leftJoin(UserEntity, 's', 's.id = t.user_id')
      .leftJoin(UserEntity, 'r', 'r.id = t.receiver_id')
      .where(
        new Brackets((qb) => {
          qb.where('t.user_id = :user_id', { user_id }).orWhere('t.receiver_id = :user_id', { user_id });
        }),
      )
      .orderBy('t.id', 'DESC');

    if (search_after) {
      queryBuilder.andWhere('t.id < :search_after', { search_after });
    }

    if (search_term) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('s.email ILIKE :search_term', {
            search_term: `%${search_term}%`,
          })
            .orWhere('r.email ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('s.phone ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('r.phone ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('sd.first_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('sd.last_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('rd.first_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            })
            .orWhere('rd.last_name ILIKE :search_term', {
              search_term: `%${search_term}%`,
            });
        }),
      );
    }

    const transactions: Array<TransfersEntity & { sender?: UserDetailsEntity; receiver?: UserDetailsEntity }> =
      await queryBuilder.limit(limit + 1).getMany();

    let has_more = false;
    let last_id = 0;

    if (transactions.length > limit) {
      has_more = true;
      transactions.splice(-1);
      const { id } = transactions.at(-1);
      last_id = id;
    }

    return {
      last_id,
      transactions: transactions.map((t) => {
        const resp: Transaction = {
          id: t.id,
          type: t.type,
          amount: t.amount,
          fee: t.fee,
          status: t.status,
          created_at: t.created_at.toJSON(),
        };
        const type = t.type;
        if (type === 'transfer') {
          if (t.user_id === user_id) {
            resp.type = 'outgoing_transfer';
            resp.participant = t.receiver;
          } else {
            resp.type = 'incoming_transfer';
            resp.participant = t.sender;
          }
        }

        return resp;
      }),
      has_more,
    };
  }
}
