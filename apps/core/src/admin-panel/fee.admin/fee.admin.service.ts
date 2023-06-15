import { CreateFeeArgumentDto } from '@/admin-panel/fee.admin/dto/arguments/create-fee.argument.dto';
import { DeleteFeeArgumentDto } from '@/admin-panel/fee.admin/dto/arguments/delete-fee.argument.dto';
import { UpdateFeeArgumentDto } from '@/admin-panel/fee.admin/dto/arguments/update-fee.argument.dto';
import { FeeEntity } from '@/payment-gateway/modules/fee/entities/fee.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from '~common/grpc/interfaces/admin_panel';
import { PaginationRequest } from '~common/interfaces/pagination';

@Injectable()
export class FeeAdminService {
  constructor(
    @InjectRepository(FeeEntity)
    private feeRepository: Repository<FeeEntity>,
  ) {}

  async createFee(fee: CreateFeeArgumentDto): Promise<Fee> {
    return this.feeRepository.save(fee);
  }

  async getFeeList(
    pagination: PaginationRequest<{ filter: { [key: string]: string[] | number[] } }>,
  ): Promise<[FeeEntity[], number]> {
    const { skip: offset, limit, order } = pagination;
    const query = this.feeRepository.createQueryBuilder('fees').orderBy(order).offset(offset).limit(limit);

    if (pagination?.params?.filter) {
      for (const [key, values] of Object.entries(pagination.params.filter)) {
        if (values.length === 0) continue;
        // todo: Implement filter by date range
        query.andWhere(`(${values.map((value) => `CAST(fees.${key} as varchar) ILIKE '%${value}%'`).join(' OR ')})`);
      }
    }

    return query.getManyAndCount();
  }

  async updateFeeById({ id, data }: UpdateFeeArgumentDto): Promise<Fee> {
    const fee = await this.feeRepository.findOne({ where: { id } });
    if (!fee) {
      throw new NotFoundException('No such fee exists');
    }

    return this.feeRepository
      .createQueryBuilder()
      .update()
      .set(data)
      .where('id = :id', { id })
      .returning('*')
      .execute()
      .then((result) => result.raw[0]);
  }

  async deleteFeeById({ id }: DeleteFeeArgumentDto): Promise<void> {
    const fee = await this.feeRepository.findOne({ where: { id } });
    if (!fee) {
      throw new NotFoundException('No such fee exists');
    }

    await this.feeRepository.delete(id);
  }
}
