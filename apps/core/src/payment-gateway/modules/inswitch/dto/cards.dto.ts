import { IsEnum, IsInt, IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { BlockCardRequest, BlockReason, SetPinRequest } from '~common/grpc/interfaces/inswitch';

export class UpgradeCardDto implements SetPinRequest {
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
  @IsNumberString()
  @Length(4)
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
