import { IsEmail, IsNotEmpty, IsPhoneNumber, ValidateIf } from 'class-validator';
import { FindByLoginRequest } from '~common/grpc/interfaces/core';

export class FindRequestDto implements FindByLoginRequest {
  @ValidateIf((obj: FindRequestDto) => !obj.phone)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ValidateIf((obj: FindRequestDto) => !obj.email)
  @IsPhoneNumber()
  @IsNotEmpty()
  phone?: string;
}
