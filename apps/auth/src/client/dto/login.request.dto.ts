import { IsNotEmpty, IsString } from 'class-validator';
import { ClientLoginRequest } from '~common/grpc/interfaces/auth';

export class SignedLoginRequestDto implements ClientLoginRequest {
  @IsNotEmpty()
  @IsString()
  login: string;
}

export class UnsignedLoginRequestDto implements ClientLoginRequest {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
