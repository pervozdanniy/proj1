import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Card,
  CardsList,
  CardsServiceController,
  CardsServiceControllerMethods,
  ExpandedCardInfo,
  RegenerateCvvResponse,
  UserId,
} from '~common/grpc/interfaces/inswitch';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { CardIdDto, CreateCardDto, SetPinDto } from '../dto/cards.dto';
import { InswitchCardsService } from '../services/cards.service';

@RpcController()
@CardsServiceControllerMethods()
export class CardsController implements CardsServiceController {
  constructor(private readonly inswitch: InswitchCardsService) {}

  async getCards({ user_id }: UserId): Promise<CardsList> {
    const cards = await this.inswitch.list(user_id);

    return { cards };
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  createCard(request: CreateCardDto): Promise<Card> {
    return this.inswitch.issueCard(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getExpandedInfo(request: CardIdDto): Promise<ExpandedCardInfo> {
    return this.inswitch.getExpandedInfo(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  setPin(request: SetPinDto) {
    return this.inswitch.setPin(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async regenerateCvv(request: CardIdDto): Promise<RegenerateCvvResponse> {
    const cvv = await this.inswitch.regenerateCvv(request);

    return { cvv };
  }
}
