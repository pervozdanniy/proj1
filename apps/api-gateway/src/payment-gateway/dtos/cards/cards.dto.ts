import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumberString, Length, MaxLength, ValidateIf } from 'class-validator';
import { Card, CardDetails, ExpandedCardInfo } from '~common/grpc/interfaces/inswitch';

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

  @ApiProperty({ enum: ['ordered', 'assigned', 'blocked', 'active', 'cancelled'] })
  status: string;

  @ApiPropertyOptional()
  pan?: string;
}

export class CardResponseDto {
  @ApiProperty({ type: CardDto })
  @Type(() => CardDto)
  card?: CardDto;
}

export class SetPinDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(4)
  pin: string;
}

class ExpandedInfoDto implements ExpandedCardInfo {
  @ApiProperty()
  cvv: string;

  @ApiProperty()
  pan: string;
}

export class CardDetailsDto implements CardDetails {
  @ApiProperty()
  reference: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  issue_date: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional({ type: ExpandedInfoDto })
  @Type(() => ExpandedInfoDto)
  expanded?: ExpandedInfoDto;
}

export enum CardBlockReason {
  CardLost = 'lost',
  CardStolen = 'stolen',
  CardInactive = 'inactive',
  CardReplaced = 'replaced',
}

export class CardBlockDto {
  @ApiProperty({ enum: Object.values(CardBlockReason) })
  @IsNotEmpty()
  @IsEnum(CardBlockReason)
  reason: CardBlockReason;
}
