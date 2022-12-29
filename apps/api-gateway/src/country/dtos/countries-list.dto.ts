import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class CountriesListDto {
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
}
