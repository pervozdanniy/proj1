import { TransfersEntity } from '@/payment-gateway/entities/transfers.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationRequest } from '~common/interfaces/pagination';

@Injectable()
export class TransferAdminService {
  constructor(@InjectRepository(TransfersEntity) private transferRepository: Repository<TransfersEntity>) {}

  getTransferList(
    pagination: PaginationRequest<{ filter: { [key: string]: string[] | number[] } }>,
  ): Promise<[TransfersEntity[], number]> {
    const { skip: offset, limit, order } = pagination;

    const query = this.transferRepository.createQueryBuilder('transfers').orderBy(order).offset(offset).limit(limit);

    if (pagination?.params?.filter) {
      for (const [key, values] of Object.entries(pagination.params.filter)) {
        if (values.length === 0) continue;
        // todo: Implement filter by date range
        query.andWhere(
          `(${values.map((value) => `CAST(transfers.${key} as varchar) ILIKE '%${value}%'`).join(' OR ')})`,
        );
      }
    }

    return query.getManyAndCount();
  }
}
