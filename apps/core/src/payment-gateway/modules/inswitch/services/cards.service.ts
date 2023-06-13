import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { BlockReason, Card, CardDetails } from '~common/grpc/interfaces/inswitch';
import { CardBlockDto, CardIdDto, CreateCardDto, SetPinDto, UpgradeCardDto } from '../dto/cards.dto';
import { InswitchAccountEntity } from '../entities/inswitch-account.entity';
import { CardStatus, CardType, InswitchCardEntity } from '../entities/inswitch-card.entity';
import { BlockCardReason, UnblockCardReason } from '../interfaces/api.interface';
import { InswitchApiService } from './api.service';
import { InswitchService } from './inswitch.service';

@Injectable()
export class InswitchCardsService {
  private readonly physicalCardProductId?: string;
  private readonly virtualCardProductId?: string;

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly api: InswitchApiService,
    private readonly inswitch: InswitchService,
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
        entity.status = card.status as CardStatus;
        entity.pan = card.maskedPan;

        return this.cardRepo.save(entity);
      }
    }

    return entity;
  }

  async findActive(userId: number) {
    return this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId })
      .andWhere('c.is_active = :is_active', { is_active: true })
      .getOne();
  }

  async list(userId: number): Promise<Card[]> {
    const cards = await this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId })
      .getMany();

    return cards.map((c) => ({
      reference: c.reference,
      is_virtual: c.isVirtual,
      currency: c.currency,
      status: c.status,
      pan: c.pan,
    }));
  }

  async issueCard(payload: CreateCardDto): Promise<Card> {
    if (!this.virtualCardProductId) {
      throw new ConflictException('Virtual cards are not supported at the moment');
    }
    const exists = await this.cardRepo.exist({ where: { is_active: true } });
    if (exists) {
      throw new ConflictException(`You've already requested a card`);
    }

    const account = await this.inswitch.accountGetOrCreate(payload.user_id);
    const card = await this.api.createCard({
      entity: account.entity_id,
      productId: this.virtualCardProductId,
      type: 'virtual',
      paymentMethodReference: account.payment_reference,
    });
    await this.api.activateCard(card.reference);

    const entity = await this.cardRepo.save(
      this.cardRepo.create({
        reference: card.cardIdentifier,
        account_id: account.id,
        currency: card.currency,
        pan: card.maskedPan,
        type: CardType.Virtual,
        status: CardStatus.Active,
        is_active: true,
      }),
    );

    return {
      reference: entity.reference,
      is_virtual: entity.isVirtual,
      pan: entity.pan,
      currency: entity.currency,
      status: entity.status,
    };
  }

  async upgrade(payload: UpgradeCardDto) {
    const entity = await this.findActive(payload.user_id);
    if (!entity) {
      throw new ConflictException('You have no cards to upgrade');
    }
    if (!this.physicalCardProductId) {
      throw new ConflictException('Physical cards are not supported at the moment');
    }
    const userDetails = await this.userDetailsRepo.findOneBy({ user_id: payload.user_id });
    const account = await this.inswitch.accountGetOrCreate(payload.user_id);
    const card = await this.api.createCard({
      entity: account.entity_id,
      productId: this.physicalCardProductId,
      type: 'physical',
      paymentMethodReference: account.payment_reference,
      cardholderName: userDetails.fullName,
      initialPin: payload.pin,
    });
    const upgraded = await this.cardRepo.save(
      this.cardRepo.create({
        reference: card.cardIdentifier,
        account_id: account.id,
        currency: card.currency,
        pan: card.maskedPan,
        type: CardType.Physical,
        status: card.status as CardStatus,
      }),
    );

    return {
      reference: upgraded.reference,
      is_virtual: upgraded.isVirtual,
      pan: upgraded.pan,
      currency: upgraded.currency,
      status: upgraded.status,
    };
  }

  async details(request: CardIdDto): Promise<CardDetails> {
    const card = await this.getCardOrFail(request);
    const details = await this.api.getCardDetails(card.reference);

    const data: CardDetails = {
      reference: details.cardIdentifier,
      status: details.status,
      issue_date: details.issueDate,
      type: details.type,
      brand: details.brand,
      currency: details.currency,
    };

    if (card.isVirtual && details.expanded_card_info) {
      data.expanded = {
        pan: details.expanded_card_info.pan,
        cvv: details.expanded_card_info.cvv,
      };
    }

    return data;
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
    const card = await this.getCardOrFail(card_id, true);
    if (card.status !== 'active') {
      throw new ConflictException('You can change pin only for active cards');
    }
    if (card.type !== CardType.Physical) {
      throw new ConflictException('This operation is applicalble only to "physical" cards!');
    }

    return this.api.cardSetPin(card_id.reference, pin);
  }

  private mapGrpcToApiReason(reason: BlockReason): BlockCardReason {
    switch (reason) {
      case BlockReason.BR_UNSPECIFIED:
      case BlockReason.UNRECOGNIZED:
      default:
        return BlockCardReason.PendingQuery;
      case BlockReason.BR_CARD_STOLEN:
        return BlockCardReason.CardStolen;
      case BlockReason.BR_CARD_LOST:
        return BlockCardReason.CardLost;
      case BlockReason.BR_CARD_INACTIVE:
        return BlockCardReason.CardInactive;
      case BlockReason.BR_CARD_REPLACED:
        return BlockCardReason.CardReplaced;
    }
  }

  async block(request: CardBlockDto) {
    const card = await this.getCardOrFail(request.card_id, true);
    if (card.status !== CardStatus.Active) {
      throw new ConflictException('Only "active" cards can be blocked');
    }
    await this.api.cardBlock(card.reference, {
      reason: this.mapGrpcToApiReason(request.reason),
      description: 'Blocking requested by the cardholder',
    });
    await this.cardRepo.update(card.reference, { status: CardStatus.Blocked });
  }

  async unblock(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== CardStatus.Blocked) {
      throw new ConflictException('Your card is not blocked!');
    }
    await this.api.cardUnblock(card.reference, {
      reason: UnblockCardReason.ByUser,
      description: 'Unblocking requested by the cardholder',
    });
    await this.cardRepo.update(card.reference, { status: CardStatus.Active });
  }

  async activatePhysical(userId: number) {
    const cards = await this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId })
      .getMany();
    const card = cards.find((c) => c.type === CardType.Physical);
    if (!card) {
      throw new ConflictException('No physical card found');
    }
    if (card.status !== CardStatus.Assigned) {
      throw new ConflictException('Only "assigned" cards can be activated');
    }
    await this.api.activateCard(card.reference);
    const refs = cards.filter((c) => c.isVirtual).map((c) => c.reference);
    this.cardRepo.manager.transaction(async (tm) => {
      const repo = tm.getRepository(InswitchCardEntity);
      await repo.update(refs, { is_active: false });
      await repo.update(card.reference, { status: CardStatus.Active, is_active: true });
    });
    await Promise.all(refs.map((ref) => this.api.cardBlock(ref, { reason: BlockCardReason.CardReplaced })));
    await this.cardRepo.update(refs, { status: CardStatus.Blocked });
  }

  async deactivate(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== CardStatus.Active) {
      throw new ConflictException('Only "active" cards can be deativated!');
    }
    await this.api.deactivateCard(card.reference);
    await this.cardRepo.update(card.reference, { status: CardStatus.Active });
  }
}
