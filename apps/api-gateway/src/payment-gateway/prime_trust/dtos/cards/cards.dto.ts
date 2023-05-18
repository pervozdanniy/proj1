import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumberString, MaxLength, ValidateIf } from 'class-validator';
import { Card, ExpandedCardInfo } from '~common/grpc/interfaces/inswitch';

export class IssueCardRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_virtual: boolean;

  @ApiPropertyOptional()
  @ValidateIf((obj: IssueCardRequestDto) => !obj.is_virtual)
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(4)
  pin?: string;
}

export class CardDto implements Card {
  @ApiProperty()
  reference: string;

  @ApiProperty()
  is_virtual: boolean;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  pan?: string;
}

export class CardsListDto {
  @ApiProperty({ type: CardDto, isArray: true })
  @Type(() => CardDto)
  cards: CardDto[];
}

export class SetPinDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(4)
  pin: string;
}

export class CardDetailsDto implements ExpandedCardInfo {
  @ApiProperty()
  cvv: string;

  @ApiProperty()
  pan: string;
}
