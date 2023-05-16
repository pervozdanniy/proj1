import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { AuthRequest } from '~common/grpc/interfaces/auth';

export class AuthRequestDto implements AuthRequest {
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  login: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}

export class RefreshRequestDto {
  @IsNotEmpty()
  @IsJWT()
  @ApiProperty()
  token: string;
}
