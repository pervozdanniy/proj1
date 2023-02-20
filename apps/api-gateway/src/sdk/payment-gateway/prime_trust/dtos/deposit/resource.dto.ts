import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResourceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resource_id: number;
}
