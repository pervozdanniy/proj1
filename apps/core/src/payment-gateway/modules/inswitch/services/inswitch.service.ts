import { UserEntity } from '@/user/entities/user.entity';
import { ConflictException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { InswitchAccountEntity } from '../entities/inswitch-account.entity';
import { InswitchWithdrawEntity, InswitchWithdrawStatus } from '../entities/inswitch-withdraw.entity';
import { InswitchApiService } from './api.service';

@Injectable()
export class InswitchService implements OnApplicationBootstrap {
  private readonly withdrawWallet: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly api: InswitchApiService,
    @InjectRepository(InswitchWithdrawEntity) private readonly withdrawRepo: Repository<InswitchWithdrawEntity>,
    @InjectRepository(InswitchAccountEntity) private readonly accountRepo: Repository<InswitchAccountEntity>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
  ) {
    this.withdrawWallet = config.get('inswitch.withdrawWallet', { infer: true });
  }

  async onApplicationBootstrap() {
    // await this.registerIfNotRegistered({ id: 9, country_code: 'CL' });
    // return this.issueCard(9).catch((error) => console.error(error.response.data));
  }

  async accountGetOrCreate(userId: number) {
    const existing = await this.accountRepo.findOneBy({ user_id: userId });
    if (existing) {
      return existing;
    }

    const user = await this.userRepo.findOneOrFail({ where: { id: userId }, relations: ['kyc', 'details'] });
    const entityId = await this.api.createEntity({
      firstName: user.details.first_name,
      lastName: user.details.last_name,
      phone: user.phone,
      email: user.email,
      address: user.details.street,
      city: user.details.city,
      postalCode: user.details.postal_code.toString(),
      country: user.country_code,
      documentType: 'nationalId',
      documentNumber: user.kyc.document_number,
      documentCountry: user.kyc.country,
    });
    const walletId = await this.api.createWallet(entityId);

    return this.accountRepo.save(
      this.accountRepo.create({
        user_id: user.id,
        entity_id: entityId,
        wallet_id: walletId,
        country: user.country_code,
      }),
    );
  }

  async withdraw(amount: number) {
    await this.withdrawRepo.save(
      this.withdrawRepo.create({
        amount,
        status: InswitchWithdrawStatus.Pending,
      }),
    );

    return this.withdrawWallet;
  }

  async balance(userId: number) {
    const account = await this.accountGetOrCreate(userId);
    if (!account || !account.wallet_id) {
      throw new ConflictException('User has no wallet');
    }

    return this.api.walletGetBalance(account.wallet_id);
  }
}
