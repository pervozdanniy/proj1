import { IsNotEmpty, ValidateIf } from 'class-validator';
import { FindByLoginRequest } from '~common/grpc/interfaces/core';

export class FindRequestDto implements FindByLoginRequest {
  @ValidateIf((obj: FindRequestDto) => !obj.phone)
  @IsNotEmpty()
  email?: string;

  @ValidateIf((obj: FindRequestDto) => !obj.email)
  @IsNotEmpty()
  phone?: string;
}
