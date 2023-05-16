import { IsBoolean, IsInt, IsNotEmpty, IsNumberString, IsUUID, Length, ValidateIf } from 'class-validator';
import { CardDetailsRequest, CreateCardRequest } from '~common/grpc/interfaces/inswitch';

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
  @Length(4)
  pin?: string;
}

export class GetDetailsDto implements CardDetailsRequest {
  @IsNotEmpty()
  @IsUUID()
  reference: string;

  @IsNotEmpty()
  @IsInt()
  user_id: number;
}
