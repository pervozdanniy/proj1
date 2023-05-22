import { UserEntity } from '@/user/entities/user.entity';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { InswitchAccountEntity } from '../entities/inswitch-account.entity';
import { InswitchAuthorizationStatus, InswitchWithdrawAuthorizationEntity } from '../entities/inswitch-withdraw.entity';
import {
  AuthorizationStatus,
  AuthorizationWebhookRequest,
  AutorizationWebhookResponse,
  TransactionStatus,
} from '../interfaces/webhook.interface';
import { InswitchApiService } from './api.service';

@Injectable()
export class InswitchService {
  #withdrawWallet: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly api: InswitchApiService,
    @InjectRepository(InswitchWithdrawAuthorizationEntity)
    private readonly withdrawRepo: Repository<InswitchWithdrawAuthorizationEntity>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(InswitchAccountEntity) private readonly accountRepo: Repository<InswitchAccountEntity>,
  ) {
    this.#withdrawWallet = config.get('inswitch.withdrawWallet', { infer: true });
  }

  get wallet() {
    return this.#withdrawWallet;
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

  async parseWithdrawRequest(payload: AuthorizationWebhookRequest) {
    const withdraw = {
      id: payload.transactionInfo.authorizationId,
      amount: Number.parseFloat(payload.transactionInfo.amount),
      currency: payload.transactionInfo.currency,
    };
    const user = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin(InswitchAccountEntity, 'ia', 'u.id = ia.user_id')
      .where('ia.entity_id = :entityId', { entityId: payload.cardInfo.entityId })
      .getOneOrFail();

    return { withdraw, user };
  }

  async approve(payload: AuthorizationWebhookRequest): Promise<AutorizationWebhookResponse> {
    await this.withdrawRepo.insert(
      this.withdrawRepo.create({
        id: payload.transactionInfo.authorizationId,
        amount: Number.parseFloat(payload.transactionInfo.amount),
        currency: payload.transactionInfo.currency,
        status: InswitchAuthorizationStatus.Pending,
        entity_id: payload.cardInfo.entityId,
      }),
    );

    return {
      authorizationId: payload.transactionInfo.authorizationId,
      status: AuthorizationStatus.Approved,
    };
  }

  decline(payload: AuthorizationWebhookRequest): AutorizationWebhookResponse {
    return {
      authorizationId: payload.transactionInfo.authorizationId,
      status: AuthorizationStatus.Declined,
    };
  }

  async updateWithdraw(payload: AuthorizationWebhookRequest) {
    const entity = await this.withdrawRepo.findOneBy({ id: payload.transactionInfo.authorizationId });
    if (!entity) {
      return;
    }
    switch (payload.transactionInfo.status) {
      case TransactionStatus.Finished:
        await this.withdrawRepo.update(entity.id, { status: InswitchAuthorizationStatus.Approved });
        break;
      case TransactionStatus.Reverted:
      case TransactionStatus.Declined:
        await this.withdrawRepo.delete(entity.id);
        break;
      case TransactionStatus.Adjusted:
        await this.withdrawRepo.update(entity.id, {
          amount: Number.parseFloat(payload.transactionInfo.amount),
          status: InswitchAuthorizationStatus.Approved,
        });
        break;
    }
  }

  getApproved() {
    return this.withdrawRepo
      .createQueryBuilder('iw')
      .select('SUM(iw.amount)', 'amount')
      .addSelect('iw.currency', 'currency')
      .addSelect('ia.user_id', 'user_id')
      .innerJoin(InswitchAccountEntity, 'ia', 'iw.entity_id = ia.entity_id')
      .where('iw.status = :status', { status: InswitchAuthorizationStatus.Approved })
      .groupBy('ia.user_id')
      .addGroupBy('iw.currency')
      .getRawIterator<{ amount: number; currency: string; user_id: number }>();
  }

  async balance(userId: number) {
    const account = await this.accountGetOrCreate(userId);
    if (!account || !account.wallet_id) {
      throw new ConflictException('User has no wallet');
    }
    const balances = await this.api.walletGetBalance(account.wallet_id);

    return balances.map((b) => ({
      currency: b.balance.currency,
      amount: Number.parseFloat(b.balance.amounts.find((a) => a.label === 'available').amount),
    }));
  }
}
