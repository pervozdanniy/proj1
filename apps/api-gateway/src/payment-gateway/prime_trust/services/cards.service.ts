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

  list(userId: number) {
    return firstValueFrom(this.cardsClient.list({ user_id: userId }));
  }

  issue(payload: IssueCardRequestDto, userId: number) {
    return firstValueFrom(this.cardsClient.issue({ user_id: userId, ...payload }));
  }

  details(reference: string, userId: number) {
    return firstValueFrom(this.cardsClient.details({ reference, user_id: userId }));
  }

  setPin(payload: { pin: string; reference: string }, userId: number) {
    return firstValueFrom(
      this.cardsClient.setPin({ card_id: { reference: payload.reference, user_id: userId }, pin: payload.pin }),
    );
  }

  regenerateCvv(reference: string, userId: number) {
    return firstValueFrom(this.cardsClient.regenerateCvv({ user_id: userId, reference }));
  }

  activate(reference: string, userId: number) {
    return firstValueFrom(this.cardsClient.activate({ user_id: userId, reference }));
  }

  deactivate(reference: string, userId: number) {
    return firstValueFrom(this.cardsClient.deactivate({ user_id: userId, reference }));
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

  block(payload: { reference: string; reason: CardBlockReason }, userId: number) {
    return firstValueFrom(
      this.cardsClient.block({
        card_id: { reference: payload.reference, user_id: userId },
        reason: this.mapApiToGrpcReason(payload.reason),
      }),
    );
  }

  unblock(reference: string, userId: number) {
    return firstValueFrom(this.cardsClient.unblock({ user_id: userId, reference }));
  }
}
