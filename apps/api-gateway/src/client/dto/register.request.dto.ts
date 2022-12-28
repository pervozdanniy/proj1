import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  countryId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => !obj?.secure)
  password?: string;

  @IsOptional()
  secure?: boolean;
}
