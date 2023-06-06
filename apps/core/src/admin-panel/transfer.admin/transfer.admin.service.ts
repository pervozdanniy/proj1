import { TransfersEntity } from '@/payment-gateway/entities/transfers.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationRequest } from '~common/interfaces/pagination';

@Injectable()
export class TransferAdminService {
  constructor(@InjectRepository(TransfersEntity) private transferRepository: Repository<TransfersEntity>) {}

  getTransferList(pagination: PaginationRequest): Promise<[TransfersEntity[], number]> {
    const { skip: offset, limit, order } = pagination;

    return this.transferRepository
      .createQueryBuilder('transfers')
      .orderBy(order)
      .offset(offset)
      .limit(limit)
      .getManyAndCount();
  }
}
