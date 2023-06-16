import { Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { BlockReason, CardsServiceClient } from '~common/grpc/interfaces/inswitch';
import { CardBlockReason, IssueCardRequestDto } from '../dtos/cards/cards.dto';

@Injectable()
export class CardsService {
  private cardsClient: CardsServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.cardsClient = this.client.getService('CardsService');
  }

  find(userId: number) {
    return firstValueFrom(this.cardsClient.find({ user_id: userId }));
  }

  issue(payload: IssueCardRequestDto, userId: number) {
    return firstValueFrom(this.cardsClient.issue({ user_id: userId, ...payload }));
  }

  upgrade(pin: string, userId: number) {
    return firstValueFrom(this.cardsClient.upgrade({ user_id: userId, pin }));
  }

  details(userId: number) {
    return firstValueFrom(this.cardsClient.details({ user_id: userId }));
  }

  setPin(pin: string, userId: number) {
    return firstValueFrom(this.cardsClient.setPin({ user_id: userId, pin }));
  }

  regenerateCvv(userId: number) {
    return firstValueFrom(this.cardsClient.regenerateCvv({ user_id: userId }));
  }

  activate(userId: number) {
    return firstValueFrom(this.cardsClient.activate({ user_id: userId }));
  }

  deactivate(userId: number) {
    return firstValueFrom(this.cardsClient.deactivate({ user_id: userId }));
  }

  private mapApiToGrpcReason(reason: CardBlockReason): BlockReason {
    switch (reason) {
      case CardBlockReason.CardLost:
        return BlockReason.BR_CARD_LOST;
      case CardBlockReason.CardStolen:
        return BlockReason.BR_CARD_STOLEN;
      case CardBlockReason.CardInactive:
        return BlockReason.BR_CARD_INACTIVE;
      case CardBlockReason.CardReplaced:
        return BlockReason.BR_CARD_REPLACED;
    }
  }

  block(reason: CardBlockReason, userId: number) {
    return firstValueFrom(
      this.cardsClient.block({
        user_id: userId,
        reason: this.mapApiToGrpcReason(reason),
      }),
    );
  }

  unblock(userId: number) {
    return firstValueFrom(this.cardsClient.unblock({ user_id: userId }));
  }
}
