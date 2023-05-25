import { ToBoolean } from '@/utils/transformer.util';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class ListNotificationsDto {
  @ApiProperty({ description: 'The number of records.', required: false, default: 20, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly limit: number = 20;

  @ApiPropertyOptional({
    description: 'Last id.',
    minimum: 1,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly search_after: number = 0;

  @ApiPropertyOptional({ description: 'Read status.' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @Type(() => Boolean)
  read?: boolean;
}
