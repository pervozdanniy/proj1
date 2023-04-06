import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UserIdDto {
  @ApiProperty({ description: 'User id', required: true, default: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly user_id: number = 1;
}
