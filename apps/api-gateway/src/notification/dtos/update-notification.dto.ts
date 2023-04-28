import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, Min } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ description: 'Notification ID.', required: true })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly id: number;

  @ApiProperty({
    description: 'Read status.',
    required: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  read: boolean;
}
