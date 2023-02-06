import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CardResourceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resource_id: string;
}
