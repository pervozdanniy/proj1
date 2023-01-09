import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { ToBoolean } from '~svc/api-gateway/src/utils/transformer.util';

export class ListNotificationsDto {
  @ApiProperty({ description: 'The number of records.', required: false, default: 20, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly limit: number = 20;

  @ApiProperty({
    description: 'Skip the number of records from the results.',
    required: false,
    default: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly offset: number = 0;

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
