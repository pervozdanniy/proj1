import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetContactsDto {
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
    description: 'Search item',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  search_term?: string;
}
