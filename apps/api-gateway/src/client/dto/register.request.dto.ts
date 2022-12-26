import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class BaseRegisterRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  countryId: number;
}

export class RegisterRequestDto extends BaseRegisterRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
