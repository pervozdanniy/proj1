import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO31661Alpha2, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsISO31661Alpha2()
  countryCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}
