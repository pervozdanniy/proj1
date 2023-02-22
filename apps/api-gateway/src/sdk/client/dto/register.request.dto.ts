import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  countryId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}
