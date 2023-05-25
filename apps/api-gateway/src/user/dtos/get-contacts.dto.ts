import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetContactsDto {
  @ApiPropertyOptional({ description: 'The number of records.', default: 20, minimum: 0 })
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

  @ApiPropertyOptional({
    description: 'Search item',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  search_term?: string;
}
