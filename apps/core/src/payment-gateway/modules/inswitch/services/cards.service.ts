import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { BlockReason, CardDetails, CardResponse } from '~common/grpc/interfaces/inswitch';
import { CardBlockDto, SetPinDto, UpgradeCardDto } from '../dto/cards.dto';
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

  private async getCardOrFail(userId: number, reload = false) {
    const entity = await this.findActive(userId);
    if (!entity) {
      throw new ConflictException('You have no active cards');
    }
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

  private findActive(userId: number) {
    return this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId })
      .andWhere('c.is_active = :is_active', { is_active: true })
      .getOne();
  }

  async getOrCreateVirtual(userId: number): Promise<CardResponse> {
    let card = await this.findActive(userId);
    if (!card) {
      card = await this.issueCard(userId);
    }

    return {
      card: {
        reference: card.reference,
        is_virtual: card.isVirtual,
        currency: card.currency,
        status: card.status,
        pan: card.pan,
      },
    };
  }

  async issueCard(userId: number): Promise<InswitchCardEntity> {
    if (!this.virtualCardProductId) {
      throw new ConflictException('Virtual cards are not supported at the moment');
    }

    const account = await this.inswitch.accountGetOrCreate(userId);
    const card = await this.api.createCard({
      entity: account.entity_id,
      productId: this.virtualCardProductId,
      type: 'virtual',
      paymentMethodReference: account.payment_reference,
    });
    await this.api.activateCard(card.cardIdentifier);

    return this.cardRepo.save(
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

  async details(user_id: number): Promise<CardDetails> {
    const card = await this.findActive(user_id);
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

  async regenerateCvv(userId: number): Promise<string> {
    const card = await this.getCardOrFail(userId);
    if (card.type === CardType.Virtual) {
      await this.api.cardRegenerateCvv(card.reference);
      const details = await this.api.getCardDetails(card.reference);

      return details.expanded_card_info.cvv;
    }

    throw new ConflictException('This operation is applicalble only to "virtual" cards!');
  }

  async setPin({ user_id, pin }: SetPinDto) {
    const card = await this.getCardOrFail(user_id, true);
    if (card.status !== 'active') {
      throw new ConflictException('You can change pin only for active cards');
    }
    if (card.type !== CardType.Physical) {
      throw new ConflictException('This operation is applicalble only to "physical" cards!');
    }

    return this.api.cardSetPin(card.reference, pin);
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
    const card = await this.getCardOrFail(request.user_id, true);
    if (card.status !== CardStatus.Active) {
      throw new ConflictException('Only "active" cards can be blocked');
    }
    await this.api.cardBlock(card.reference, {
      reason: this.mapGrpcToApiReason(request.reason),
      description: 'Blocking requested by the cardholder',
    });
    await this.cardRepo.update(card.reference, { status: CardStatus.Blocked });
  }

  async unblock(user_id: number) {
    const card = await this.getCardOrFail(user_id, true);
    if (card.status !== CardStatus.Blocked) {
      throw new ConflictException('Your card is not blocked!');
    }
    await this.api.cardUnblock(card.reference, {
      reason: UnblockCardReason.ByUser,
      description: 'Unblocking requested by the cardholder',
    });
    await this.cardRepo.update(card.reference, { status: CardStatus.Active });
  }

  async deactivate(userId: number) {
    const card = await this.getCardOrFail(userId, true);
    if (card.status !== CardStatus.Active) {
      throw new ConflictException('Only "active" cards can be deativated!');
    }
    await this.api.deactivateCard(card.reference);
    await this.cardRepo.update(card.reference, { status: CardStatus.Cancelled });
  }

  async activatePhysical(userId: number) {
    const cards = await this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId })
      .getMany();
    const entity = cards.find((c) => c.type === CardType.Physical);
    if (!entity) {
      throw new ConflictException('No physical card found');
    }
    const card = await this.api.getCardDetails(entity.reference);
    if (card.status !== CardStatus.Assigned) {
      throw new ConflictException('Only "assigned" cards can be activated');
    }
    await this.api.activateCard(entity.reference);
    const virtualRefs = cards.filter((c) => c.isVirtual).map((c) => c.reference);
    this.cardRepo.manager.transaction(async (tm) => {
      const repo = tm.getRepository(InswitchCardEntity);
      await repo.update(virtualRefs, { is_active: false });
      await repo.update(entity.reference, { status: CardStatus.Active, is_active: true });
    });
    await Promise.all(virtualRefs.map((ref) => this.api.cardBlock(ref, { reason: BlockCardReason.CardReplaced })));
    await this.cardRepo.update(virtualRefs, { status: CardStatus.Blocked });
  }
}
