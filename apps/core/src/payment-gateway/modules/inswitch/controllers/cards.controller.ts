import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserIdRequest } from '~common/grpc/interfaces/common';
import {
  Card,
  CardDetails,
  CardResponse,
  CardsServiceController,
  CardsServiceControllerMethods,
  RegenerateCvvResponse,
} from '~common/grpc/interfaces/inswitch';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { CardBlockDto, CreateCardDto, SetPinDto, UpgradeCardDto } from '../dto/cards.dto';
import { InswitchCardsService } from '../services/cards.service';

@RpcController()
@CardsServiceControllerMethods()
export class CardsController implements CardsServiceController {
  constructor(private readonly inswitch: InswitchCardsService) {}

  upgrade(request: UpgradeCardDto): Promise<Card> {
    return this.inswitch.upgrade(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  activate({ user_id }: UserIdRequest) {
    return this.inswitch.activatePhysical(user_id);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  deactivate({ user_id }: UserIdRequest) {
    return this.inswitch.deactivate(user_id);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  block(request: CardBlockDto) {
    return this.inswitch.block(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  unblock({ user_id }: UserIdRequest) {
    return this.inswitch.unblock(user_id);
  }

  find({ user_id }: UserIdRequest): Promise<CardResponse> {
    return this.inswitch.find(user_id);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  issue(request: CreateCardDto): Promise<Card> {
    return this.inswitch.issueCard(request);
  }

  details({ user_id }: UserIdRequest): Promise<CardDetails> {
    return this.inswitch.details(user_id);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  setPin(request: SetPinDto) {
    return this.inswitch.setPin(request);
  }

  async regenerateCvv(request: UserIdRequest): Promise<RegenerateCvvResponse> {
    const cvv = await this.inswitch.regenerateCvv(request.user_id);

    return { cvv };
  }
}
