import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
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
import { CardDetailsDto, CardDto, CardsListDto, IssueCardRequestDto, SetPinDto } from '../dtos/cards/cards.dto';
import { CardsService } from '../services/cards.service';

@ApiTags('Cards')
@Controller({ version: '1', path: 'cards' })
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @ApiOperation({ summary: "List user's cards" })
  @ApiOkResponse({ type: CardDto })
  @ApiBearerAuth()
  @Get()
  list(@JwtSessionUser() { id }: User): Promise<CardsListDto> {
    return this.cards.list(id);
  }

  @ApiOperation({ summary: 'Issue card' })
  @ApiCreatedResponse({ type: CardDto })
  @ApiBearerAuth()
  @Post()
  @JwtSessionAuth({ requireKYC: true })
  issue(@Body() payload: IssueCardRequestDto, @JwtSessionUser() { id }: User): Promise<CardDto> {
    return this.cards.issue(payload, id);
  }

  @ApiOperation({ summary: "Get card's details" })
  @ApiOkResponse({ type: CardDetailsDto })
  @ApiBearerAuth()
  @Get(':reference')
  details(@Param('reference') reference: string, @JwtSessionUser() { id }: User): Promise<CardDetailsDto> {
    return this.cards.details(reference, id);
  }

  @ApiOperation({ summary: 'Set pin for physical card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':reference/pin')
  async setPin(@Param('reference') reference: string, @Body() { pin }: SetPinDto, @JwtSessionUser() { id }: User) {
    await this.cards.setPin({ pin, reference }, id);
  }

  @ApiOperation({ summary: 'Regenerate cvv for virtual card' })
  @ApiNoContentResponse()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':reference/pin')
  async regenerateCvv(@Param('reference') reference: string, @JwtSessionUser() { id }: User) {
    await this.cards.regenerateCvv(reference, id);
  }
}
