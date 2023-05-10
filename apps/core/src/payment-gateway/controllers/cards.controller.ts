import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Card,
  CardDetailsRequest,
  CardsList,
  CardsServiceController,
  CardsServiceControllerMethods,
  ExpandedCardInfo,
  UserIdRequest,
} from '~common/grpc/interfaces/inswitch';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { CreateCardDto } from '../dto/inswitch.dto';
import { InswitchService } from '../services/inswitch/inswitch.service';

@RpcController()
@CardsServiceControllerMethods()
export class CardsController implements CardsServiceController {
  constructor(private readonly inswitch: InswitchService) {}

  async getCards({ user_id }: UserIdRequest): Promise<CardsList> {
    const cards = await this.inswitch.getCards(user_id);

    return { cards };
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  createCard(request: CreateCardDto): Promise<Card> {
    return this.inswitch.issueCard(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getExpandedInfo(request: CardDetailsRequest): Promise<ExpandedCardInfo> {
    return this.inswitch.getExpandedInfo(request);
  }
}
