import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Card, ExpandedCardInfo } from '~common/grpc/interfaces/inswitch';
import { CardBlockDto, CardIdDto, CreateCardDto, SetPinDto } from '../dto/cards.dto';
import { InswitchAccountEntity } from '../entities/inswitch-account.entity';
import { CardType, InswitchCardEntity } from '../entities/inswitch-card.entity';
import { CreateCardRequest, UnblockCardReason } from './api.interface';
import { InswitchApiService } from './api.service';

@Injectable()
export class InswitchCardsService {
  private readonly physicalCardProductId?: string;
  private readonly virtualCardProductId?: string;

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly api: InswitchApiService,
    @InjectRepository(InswitchAccountEntity) private readonly accountRepo: Repository<InswitchAccountEntity>,
    @InjectRepository(InswitchCardEntity) private readonly cardRepo: Repository<InswitchCardEntity>,
    @InjectRepository(UserDetailsEntity) private readonly userDetailsRepo: Repository<UserDetailsEntity>,
  ) {
    const cards = config.get('inswitch.cards', { infer: true });
    this.physicalCardProductId = cards.physicalCardProductId;
    this.virtualCardProductId = cards.virtualCardProductId;
  }

  private async getCardOrFail({ user_id, reference }: CardIdDto, reload = false) {
    const entity = await this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId: user_id })
      .andWhere({ reference })
      .getOneOrFail();

    if (reload) {
      const card = await this.api.getCardDetails(entity.reference);
      if (entity.status !== card.status) {
        return this.cardRepo.save(entity);
      }
    }

    return entity;
  }

  async getAndSetUpAccount(userId: number) {
    const account = await this.accountRepo.findOneByOrFail({ user_id: userId });
    let needsUpdate = false;
    if (!account.wallet_id) {
      needsUpdate = true;
      account.wallet_id = await this.api.createWallet(account.entity_id);
    }
    if (!account.payment_reference) {
      needsUpdate = true;
      const paymentMethods = await this.api.getAvailablePaymentMethods({
        country: account.country,
        direction: 'out',
        paymentMethodTypeClass: 'emoney',
        paymentMethodTypeStatus: 'available',
      });
      const paymentMethod = paymentMethods.find((pm) => pm.country === account.country);
      if (!paymentMethod) {
        throw new ConflictException('No payment methods are available in your country');
      }
      account.payment_reference = await this.api.createPaymentMethod({
        walletId: account.wallet_id,
        paymentMethodType: paymentMethod.paymentMethodType,
      });
    }
    if (needsUpdate) await this.accountRepo.save(account);

    return account;
  }

  async list(userId: number): Promise<Card[]> {
    const cards = await this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId })
      .getMany();

    return cards.map((c) => ({
      reference: c.reference,
      is_virtual: c.type === CardType.Virtual,
      currency: c.currency,
      pan: c.pan,
    }));
  }

  async issueCard(payload: CreateCardDto): Promise<Card> {
    const account = await this.getAndSetUpAccount(payload.user_id);

    let data: CreateCardRequest;
    if (payload.is_virtual) {
      if (!this.virtualCardProductId) {
        throw new ConflictException('Virtual cards are not supported at the moment');
      }
      data = {
        entity: account.entity_id,
        productId: this.virtualCardProductId,
        type: 'virtual',
        paymentMethodReference: account.payment_reference,
      };
    } else {
      if (!this.physicalCardProductId) {
        throw new ConflictException('Physical cards are not supported at the moment');
      }
      const userDetails = await this.userDetailsRepo.findOneBy({ user_id: account.user_id });
      data = {
        entity: account.entity_id,
        productId: this.physicalCardProductId,
        type: 'physical',
        paymentMethodReference: account.payment_reference,
        cardholderName: userDetails.fullName,
        initialPin: payload.pin,
      };
    }

    const card = await this.api.createCard(data);
    const entity = await this.cardRepo.save(
      this.cardRepo.create({
        reference: card.cardIdentifier,
        account_id: account.id,
        currency: card.currency,
        pan: card.maskedPan,
        type: payload.is_virtual ? CardType.Virtual : CardType.Physical,
        status: card.status,
      }),
    );

    return {
      reference: entity.reference,
      is_virtual: payload.is_virtual,
      pan: entity.pan,
      currency: entity.currency,
    };
  }

  async getExpandedInfo(request: CardIdDto): Promise<ExpandedCardInfo> {
    const card = await this.getCardOrFail(request);
    const details = await this.api.getCardDetails(card.reference);

    return { pan: details.expanded_card_info.pan, cvv: details.expanded_card_info.cvv };
  }

  async regenerateCvv(request: CardIdDto): Promise<string> {
    const card = await this.getCardOrFail(request);
    if (card.type === CardType.Virtual) {
      await this.api.cardRegenerateCvv(request.reference);
      const details = await this.api.getCardDetails(request.reference);

      return details.expanded_card_info.cvv;
    }

    throw new ConflictException('This operation is applicalble only to "virtual" cards!');
  }

  async setPin({ card_id, pin }: SetPinDto) {
    const card = await this.getCardOrFail(card_id);
    if (card.type === CardType.Physical) {
      return this.api.cardSetPin(card_id.reference, pin);
    }

    throw new ConflictException('This operation is applicalble only to "physical" cards!');
  }

  async block(request: CardBlockDto) {
    const card = await this.getCardOrFail(request.card_id, true);
    if (card.status === 'active') {
      throw new ConflictException('You can block only active cards!');
    }
    await this.api.cardBlock(card.reference, { reason: request.reason });
    await this.cardRepo.update(card.reference, { status: 'blocked' });
  }

  async unblock(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== 'blocked') {
      throw new ConflictException('Your card is not blocked!');
    }
    await this.api.cardUnblock(card.reference, { reason: UnblockCardReason.ByUser });
    await this.cardRepo.update(card.reference, { status: 'active' });
  }

  async activate(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== 'assigned') {
      throw new ConflictException('Card is not assigned yet or already activated!');
    }
    await this.api.activateCard(card.reference);
    await this.cardRepo.update(card.reference, { status: 'active' });
  }

  async deactivate(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== 'active') {
      throw new ConflictException('You can deactivate only active cards!');
    }
    await this.api.deactivateCard(card.reference);
    await this.cardRepo.update(card.reference, { status: 'cancelled' });
  }
}
