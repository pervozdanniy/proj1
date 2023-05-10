import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { ConflictException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, ExpandedCardInfo } from '~common/grpc/interfaces/inswitch';
import { CreateCardDto, GetDetailsDto } from '../../dto/inswitch.dto';
import { InswitchAccountEntity } from '../../entities/inswitch/inswitch-account.entity';
import { CardType, InswitchCardEntity } from '../../entities/inswitch/inswitch-card.entity';
import { CreateCardRequest } from './api.interface';
import { InswitchApiService } from './api.service';

@Injectable()
export class InswitchService implements OnApplicationBootstrap {
  constructor(
    private readonly api: InswitchApiService,
    @InjectRepository(InswitchAccountEntity) private readonly accountRepo: Repository<InswitchAccountEntity>,
    @InjectRepository(InswitchCardEntity) private readonly cardRepo: Repository<InswitchCardEntity>,
    @InjectRepository(UserDetailsEntity) private readonly userRepo: Repository<UserDetailsEntity>,
  ) {}

  async onApplicationBootstrap() {
    // await this.registerIfNotRegistered({ id: 9, country_code: 'CL' });
    // return this.issueCard(9).catch((error) => console.error(error.response.data));
  }

  async registerIfNotRegistered(user: any) {
    const count = await this.accountRepo.countBy({ user_id: user.id });
    if (count > 0) {
      return;
    }
    const entityId = await this.api.createEntity();
    const walletId = await this.api.createWallet(entityId);
    await this.accountRepo.insert(
      this.accountRepo.create({
        user_id: user.id,
        entity_id: entityId,
        wallet_id: walletId,
        country: user.country_code,
      }),
    );
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

  async issueCard(payload: CreateCardDto): Promise<Card> {
    const account = await this.getAndSetUpAccount(payload.user_id);

    let data: CreateCardRequest;
    if (payload.is_virtual) {
      data = {
        entity: account.entity_id,
        productId: 'NominatedCard',
        type: 'virtual',
        paymentMethodReference: account.payment_reference,
      };
    } else {
      const userDetails = await this.userRepo.findOneBy({ user_id: account.user_id });
      data = {
        entity: account.entity_id,
        productId: 'NominatedCard',
        type: 'physical',
        paymentMethodReference: account.payment_reference,
        cardholderName: userDetails.fullName,
        initialPin: payload.pin,
      };
    }

    const card = await this.api.createCard(data);
    await this.api.activateCard(card.cardIdentifier);

    const entity = await this.cardRepo.save(
      this.cardRepo.create({
        reference: card.cardIdentifier,
        account_id: account.id,
        currency: card.currency,
        pan: card.maskedPan,
      }),
    );

    return {
      reference: entity.reference,
      is_virtual: entity.type === CardType.Virtual,
      pan: entity.pan,
      currency: entity.currency,
    };
  }

  async getCards(userId: number): Promise<Card[]> {
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

  async getExpandedInfo(request: GetDetailsDto): Promise<ExpandedCardInfo> {
    const card = await this.cardRepo
      .createQueryBuilder('c')
      .innerJoin(InswitchAccountEntity, 'a', 'a.id = c.account_id')
      .where('a.user_id = :userId', { userId: request.user_id })
      .andWhere({ reference: request.reference })
      .getOneOrFail();

    const details = await this.api.getCardDetails(card.reference);

    return { pan: details.expanded_card_info.pan, cvv: details.expanded_card_info.cvv };
  }
}
