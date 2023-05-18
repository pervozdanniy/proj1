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
import { CardId, CreateCardRequest, SetPinRequest } from '~common/grpc/interfaces/inswitch';
import { BlockCardReason } from '../services/api.interface';

export class CreateCardDto implements CreateCardRequest {
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

export class CardBlockDto {
  @IsNotEmpty()
  @IsEnum(BlockCardReason)
  reason: BlockCardReason;

  @ValidateNested()
  @Type(() => CardIdDto)
  card_id: CardIdDto;
}
