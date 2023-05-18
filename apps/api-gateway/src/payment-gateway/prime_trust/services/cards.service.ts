import { Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { CardsServiceClient } from '~common/grpc/interfaces/inswitch';
import { IssueCardRequestDto } from '../dtos/cards/cards.dto';

@Injectable()
export class CardsService {
  private cardsClient: CardsServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.cardsClient = this.client.getService('CardsService');
  }

  list(userId: number) {
    return firstValueFrom(this.cardsClient.getCards({ user_id: userId }));
  }

  issue(payload: IssueCardRequestDto, userId: number) {
    return firstValueFrom(this.cardsClient.createCard({ user_id: userId, ...payload }));
  }

  details(reference: string, userId: number) {
    return firstValueFrom(this.cardsClient.getExpandedInfo({ reference, user_id: userId }));
  }

  setPin(payload: { pin: string; reference: string }, userId: number) {
    return firstValueFrom(
      this.cardsClient.setPin({ card_id: { reference: payload.reference, user_id: userId }, pin: payload.pin }),
    );
  }

  regenerateCvv(reference: string, userId: number) {
    return firstValueFrom(this.cardsClient.regenerateCvv({ user_id: userId, reference }));
  }
}
