import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/http-session';
import {
  CardBlockDto,
  CardDetailsDto,
  CardDto,
  CardResponseDto,
  IssueCardRequestDto,
  SetPinDto,
} from '../dtos/cards/cards.dto';
import { CardsService } from '../services/cards.service';

@ApiTags('Cards')
@Controller({ version: '1', path: 'cards' })
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @ApiOperation({ summary: "List user's cards" })
  @ApiOkResponse({ type: CardDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Get()
  find(@JwtSessionUser() { id }: User): Promise<CardResponseDto> {
    return this.cards.find(id);
  }

  @ApiOperation({ summary: 'Issue card' })
  @ApiCreatedResponse({ type: CardDto })
  @ApiBearerAuth()
  @Post()
  @JwtSessionAuth({ requireKYC: true })
  issue(@Body() payload: IssueCardRequestDto, @JwtSessionUser() { id }: User): Promise<CardDto> {
    return this.cards.issue(payload, id);
  }

  @ApiOperation({ summary: 'Upgrade virtual to physical card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Patch('upgrade')
  async upgrade(@Body() { pin }: SetPinDto, @JwtSessionUser() { id }: User): Promise<CardDto> {
    return this.cards.upgrade(pin, id);
  }

  @ApiOperation({ summary: "Get card's details" })
  @ApiOkResponse({ type: CardDetailsDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Get('')
  details(@JwtSessionUser() { id }: User): Promise<CardDetailsDto> {
    return this.cards.details(id);
  }

  @ApiOperation({ summary: 'Set pin for physical card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('pin')
  async setPin(@Body() { pin }: SetPinDto, @JwtSessionUser() { id }: User) {
    await this.cards.setPin(pin, id);
  }

  @ApiOperation({ summary: 'Regenerate cvv for virtual card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('regenerate_cvv')
  async regenerateCvv(@JwtSessionUser() { id }: User) {
    await this.cards.regenerateCvv(id);
  }

  @ApiOperation({ summary: 'Activate physical card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('activate')
  async activate(@JwtSessionUser() { id }: User) {
    await this.cards.activate(id);
  }

  @ApiOperation({ summary: 'Deactivate card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('deactivate')
  async deactivate(@JwtSessionUser() { id }: User) {
    await this.cards.deactivate(id);
  }

  @ApiOperation({ summary: 'Block card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('block')
  async block(@Body() { reason }: CardBlockDto, @JwtSessionUser() { id }: User) {
    await this.cards.block(reason, id);
  }

  @ApiOperation({ summary: 'Unblock card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('unblock')
  async unblock(@JwtSessionUser() { id }: User) {
    await this.cards.unblock(id);
  }
}
