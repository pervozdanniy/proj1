import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExchangeDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency_type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ description: 'Comma separated currency codes' })
  currencies?: string[];
}
