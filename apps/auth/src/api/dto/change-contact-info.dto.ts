import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';
import { ChangeContactInfoRequest } from '~common/grpc/interfaces/auth';

export class ChangeContactInfoDto implements ChangeContactInfoRequest {
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
