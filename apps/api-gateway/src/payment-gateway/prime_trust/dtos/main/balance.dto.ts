import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class BalanceRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','), { toClassOnly: true })
  @ApiPropertyOptional({ description: 'Comma separated currency codes' })
  currencies?: string[];
}
