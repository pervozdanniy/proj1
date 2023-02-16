import { BankAccountEntity } from '@/sdk/payment-gateway/entities/prime_trust/bank-account.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountParams, BankAccountsResponse } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class PrimeBankAccountManager {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountEntityRepository: Repository<BankAccountEntity>,
  ) {}
  async addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    const { id, bank_account_name, bank_account_number, routing_number } = request;
    const bankAccount = await this.bankAccountEntityRepository.findOne({ where: { bank_account_number, user_id: id } });
    if (bankAccount) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'Bank already exist!', 400);
    }

    const account = await this.bankAccountEntityRepository.save(
      this.bankAccountEntityRepository.create({
        user_id: id,
        bank_account_name,
        bank_account_number,
        routing_number,
      }),
    );

    return account;
  }

  async getBankAccounts(user_id: number): Promise<BankAccountsResponse> {
    const bankAccount = await this.bankAccountEntityRepository.find({ where: { user_id } });

    return { data: bankAccount };
  }

  async getBankAccountById(id: number): Promise<BankAccountEntity> {
    return await this.bankAccountEntityRepository.findOneBy({ id });
  }
}
