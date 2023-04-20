import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class UserIdDto {
  @ApiProperty({ description: 'token' })
  @IsString()
  @Type(() => String)
  readonly token: string;
}
