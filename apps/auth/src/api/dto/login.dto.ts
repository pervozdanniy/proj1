import { IsNotEmpty, IsString } from 'class-validator';
import { AuthRequest } from '~common/grpc/interfaces/auth';

export class LoginRequestDto implements AuthRequest {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
