import { IsEmail, IsNotEmpty, IsPhoneNumber, ValidateIf } from 'class-validator';
import { ResetPasswordStartRequest } from '~common/grpc/interfaces/auth';

export class ResetPasswordDto implements ResetPasswordStartRequest {
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((obj: ResetPasswordDto) => !obj.phone)
  email?: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @ValidateIf((obj: ResetPasswordDto) => !obj.email)
  phone?: string;
}
