import { ToBoolean } from '@/api/utils/transformer.util';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class ListNotificationsDto {
  @ApiProperty({ description: 'The number of records.', required: false, default: 20, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly limit: number = 20;

  @ApiProperty({
    description: 'Last id.',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly search_after: number = 0;

  @ApiProperty({
    description: 'Read status.',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @Type(() => Boolean)
  read?: boolean;
}
