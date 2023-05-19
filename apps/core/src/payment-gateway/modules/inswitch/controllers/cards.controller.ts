import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Card,
  CardDetails,
  CardsList,
  CardsServiceController,
  CardsServiceControllerMethods,
  RegenerateCvvResponse,
  UserId,
} from '~common/grpc/interfaces/inswitch';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { CardBlockDto, CardIdDto, CreateCardDto, SetPinDto } from '../dto/cards.dto';
import { InswitchCardsService } from '../services/cards.service';

@RpcController()
@CardsServiceControllerMethods()
export class CardsController implements CardsServiceController {
  constructor(private readonly inswitch: InswitchCardsService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  activate(request: CardIdDto) {
    return this.inswitch.activate(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  deactivate(request: CardIdDto) {
    return this.inswitch.deactivate(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  block(request: CardBlockDto) {
    return this.inswitch.block(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  unblock(request: CardIdDto) {
    return this.inswitch.unblock(request);
  }

  async list({ user_id }: UserId): Promise<CardsList> {
    const cards = await this.inswitch.list(user_id);

    return { cards };
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  issue(request: CreateCardDto): Promise<Card> {
    return this.inswitch.issueCard(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  details(request: CardIdDto): Promise<CardDetails> {
    return this.inswitch.details(request);
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
