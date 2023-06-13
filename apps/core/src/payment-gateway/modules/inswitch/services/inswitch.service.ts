import { UserEntity } from '@/user/entities/user.entity';
import { ConflictException, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Fraction from 'fraction.js';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { KYCDocumentType } from '~svc/core/src/payment-gateway/modules/veriff/entities/veriff-document.entity';
import { InswitchAccountEntity } from '../entities/inswitch-account.entity';
import { InswitchAuthorizationStatus, InswitchWithdrawAuthorizationEntity } from '../entities/inswitch-withdraw.entity';
import { CreateEntityRequest } from '../interfaces/api.interface';
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

  private mapDocumentTypes(internal: KYCDocumentType): CreateEntityRequest['documentType'] {
    switch (internal) {
      case 'ID_CARD':
        return 'nationalId';
      case 'PASSPORT':
        return 'passport';
      default:
        throw new ConflictException('Unsupported KYC document type');
    }
  }

  async accountGetOrCreate(userId: number) {
    const existing = await this.accountRepo.findOneBy({ user_id: userId });
    if (existing) {
      return existing;
    }

    const user = await this.userRepo.findOneOrFail({ where: { id: userId }, relations: ['documents', 'details'] });
    const document = user.documents.find((d) => d.label === 'ID_CARD' || d.label === 'PASSPORT');
    if (!document) {
      throw new ConflictException('Only "ID_CARD" and "PASSPORT" documents are allowed for card payments');
    }

    const paymentMethods = await this.api.getAvailablePaymentMethods({
      country: user.country_code,
      direction: 'out',
      paymentMethodTypeClass: 'emoney',
      paymentMethodTypeStatus: 'available',
    });
    const paymentMethod = paymentMethods.find((pm) => pm.country === user.country_code);
    if (!paymentMethod) {
      throw new ConflictException('Card payments are not available in your country');
    }

    const entityId = await this.api.createEntity({
      firstName: user.details.first_name,
      lastName: user.details.last_name,
      phone: user.phone,
      email: user.email,
      address: user.details.street,
      city: user.details.city,
      postalCode: user.details.postal_code.toString(),
      country: user.country_code,
      documentType: this.mapDocumentTypes(document.label),
      documentNumber: document.document_number,
      documentCountry: document.country,
    });
    const walletId = await this.api.createWallet(entityId);
    const payment_reference = await this.api.createPaymentMethod({
      walletId,
      paymentMethodType: paymentMethod.paymentMethodType,
    });

    return this.accountRepo.save(
      this.accountRepo.create({
        user_id: user.id,
        entity_id: entityId,
        wallet_id: walletId,
        country: user.country_code,
        payment_reference,
      }),
    );
  }

  async parseWithdrawRequest(payload: AuthorizationWebhookRequest) {
    const withdraw = {
      id: payload.transactionInfo.authorizationId,
      amount: payload.transactionInfo.amount,
      currency: payload.transactionInfo.currency,
      rate: payload.transactionInfo.fx_rate,
    };
    const user = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin(InswitchAccountEntity, 'ia', 'u.id = ia.user_id')
      .where('ia.entity_id = :entityId', { entityId: payload.cardInfo.entityId })
      .getOneOrFail();

    return { withdraw, user };
  }

  async approve(
    payload: AuthorizationWebhookRequest,
    amounts: { user: Fraction; fee: Fraction },
  ): Promise<AutorizationWebhookResponse> {
    await this.withdrawRepo.insert(
      this.withdrawRepo.create({
        id: payload.transactionInfo.authorizationId,
        amount: payload.transactionInfo.amount,
        amount_usd: amounts.user.toString(),
        fee_usd: amounts.fee.toString(),
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
      throw new UnauthorizedException();
    }
    switch (payload.transactionInfo.status) {
      case TransactionStatus.Finished:
        await this.withdrawRepo.update(entity.id, { status: InswitchAuthorizationStatus.Approved });

        return { approved: true, amount: entity.amount };
      case TransactionStatus.Reverted:
      case TransactionStatus.Declined:
        await this.withdrawRepo.delete(entity.id);

        return { approved: false, amount: entity.amount };

      default:
        return { approved: true, amount: entity.amount };
    }
  }

  async startProcessing() {
    await this.withdrawRepo.update(
      { status: InswitchAuthorizationStatus.Approved },
      { status: InswitchAuthorizationStatus.Processing },
    );

    return this.withdrawRepo
      .createQueryBuilder('iw')
      .select('SUM(iw.amount_usd)', 'amount')
      .addSelect('SUM(iw.fee_usd)', 'fee')
      .where('iw.status = :status', { status: InswitchAuthorizationStatus.Processing })
      .getRawOne<{ amount: string; fee: string }>();
  }

  async finishProcessing() {
    await this.withdrawRepo.update(
      { status: InswitchAuthorizationStatus.Processing },
      { status: InswitchAuthorizationStatus.Processed },
    );
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

  async paymentReference(userId: number) {
    const account = await this.accountGetOrCreate(userId);

    return account.payment_reference;
  }
}
