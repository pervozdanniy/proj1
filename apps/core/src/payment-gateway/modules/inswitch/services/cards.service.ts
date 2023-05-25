import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { BlockReason, Card, CardDetails } from '~common/grpc/interfaces/inswitch';
import { CardBlockDto, CardIdDto, CreateCardDto, SetPinDto } from '../dto/cards.dto';
import { InswitchAccountEntity } from '../entities/inswitch-account.entity';
import { CardType, InswitchCardEntity } from '../entities/inswitch-card.entity';
import { BlockCardReason, CreateCardRequest, UnblockCardReason } from '../interfaces/api.interface';
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
        entity.status = card.status;
        entity.pan = card.maskedPan;

        return this.cardRepo.save(entity);
      }
    }

    return entity;
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
      status: c.status,
      pan: c.pan,
    }));
  }

  async issueCard(payload: CreateCardDto): Promise<Card> {
    const account = await this.inswitch.accountGetOrCreate(payload.user_id);

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
      status: entity.status,
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
    if (card.status !== 'active') {
      throw new ConflictException('Only "active" cards can be blocked');
    }
    await this.api.cardBlock(card.reference, {
      reason: this.mapGrpcToApiReason(request.reason),
      description: 'Blocking requested by the cardholder',
    });
    await this.cardRepo.update(card.reference, { status: 'blocked' });
  }

  async unblock(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== 'blocked') {
      throw new ConflictException('Your card is not blocked!');
    }
    await this.api.cardUnblock(card.reference, {
      reason: UnblockCardReason.ByUser,
      description: 'Unblocking requested by the cardholder',
    });
    await this.cardRepo.update(card.reference, { status: 'active' });
  }

  async activate(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== 'assigned') {
      throw new ConflictException('Only "assigned" cards can be activated');
    }
    await this.api.activateCard(card.reference);
    await this.cardRepo.update(card.reference, { status: 'active' });
  }

  async deactivate(request: CardIdDto) {
    const card = await this.getCardOrFail(request, true);
    if (card.status !== 'active') {
      throw new ConflictException('Only "active" cards can be deativated!');
    }
    await this.api.deactivateCard(card.reference);
    await this.cardRepo.update(card.reference, { status: 'cancelled' });
  }
}
