import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WebhookUrlDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}
