import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { BlockCardRequest, BlockReason, IssueCardRequest, SetPinRequest } from '~common/grpc/interfaces/inswitch';

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

export class UpgradeCardDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsNumberString()
  @Length(4)
  pin: string;
}

export class SetPinDto implements SetPinRequest {
  @IsNotEmpty()
  @IsString()
  @MaxLength(4)
  pin: string;

  @IsNotEmpty()
  @IsInt()
  user_id: number;
}

export class CardBlockDto implements BlockCardRequest {
  @IsNotEmpty()
  @IsEnum(BlockReason)
  reason: BlockReason;

  @IsNotEmpty()
  @IsInt()
  user_id: number;
}
