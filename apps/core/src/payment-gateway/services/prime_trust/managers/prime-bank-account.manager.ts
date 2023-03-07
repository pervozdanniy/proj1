import { BankAccountEntity } from '@/payment-gateway/entities/prime_trust/bank-account.entity';
import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountParams, BankAccountsResponse, BanksInfoResponse } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class PrimeBankAccountManager {
  private logger = new Logger(PrimeBankAccountManager.name);
  constructor(
    private userService: UserService,
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountEntityRepository: Repository<BankAccountEntity>,
  ) {}
  async addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    const { id, bank_account_name, bank_account_number, routing_number } = request;
    const userDetails = await this.userService.getUserInfo(id);
    if (!routing_number) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Please fill routing number!', 400);
    }
    const bankAccount = await this.bankAccountEntityRepository.findOne({ where: { bank_account_number, user_id: id } });
    if (bankAccount) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'Bank already exist!', 400);
    }

    const account = await this.bankAccountEntityRepository.save(
      this.bankAccountEntityRepository.create({
        user_id: id,
        country: userDetails.country_code,
        bank_account_name,
        bank_account_number,
        routing_number,
      }),
    );

    return account;
  }

  async getBankAccounts(user_id: number, country: string): Promise<BankAccountsResponse> {
    const bankAccount = await this.bankAccountEntityRepository.find({ where: { user_id, country } });

    return { data: bankAccount };
  }

  async getBankAccountById(id: number): Promise<BankAccountEntity> {
    return await this.bankAccountEntityRepository.findOneBy({ id });
  }

  async getBanksInfo(country: string): Promise<BanksInfoResponse> {
    this.logger.log(country);

    return {
      data: [],
    };
  }
}
