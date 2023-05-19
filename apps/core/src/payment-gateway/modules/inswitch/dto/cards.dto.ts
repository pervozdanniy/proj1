import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  BlockCardRequest,
  BlockReason,
  CardId,
  IssueCardRequest,
  SetPinRequest,
} from '~common/grpc/interfaces/inswitch';

export class CreateCardDto implements IssueCardRequest {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsBoolean()
  is_virtual: boolean;

  @ValidateIf((obj: CreateCardDto) => !obj.is_virtual)
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(4)
  pin?: string;
}

export class CardIdDto implements CardId {
  @IsNotEmpty()
  @IsUUID()
  reference: string;

  @IsNotEmpty()
  @IsInt()
  user_id: number;
}

export class SetPinDto implements SetPinRequest {
  @IsNotEmpty()
  @IsString()
  @MaxLength(4)
  pin: string;

  @ValidateNested()
  @Type(() => CardIdDto)
  card_id: CardIdDto;
}

export class CardBlockDto implements BlockCardRequest {
  @IsNotEmpty()
  @IsEnum(BlockReason)
  reason: BlockReason;

  @ValidateNested()
  @Type(() => CardIdDto)
  card_id: CardIdDto;
}
