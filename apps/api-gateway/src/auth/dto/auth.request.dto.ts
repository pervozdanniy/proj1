import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthRequest } from '~common/grpc/interfaces/auth';

export class AuthRequestDto implements AuthRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  login: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
