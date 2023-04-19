import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExchangeDto {
  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  amount: string;

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
