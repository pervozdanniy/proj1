import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  read: boolean;

  constructor(partial: Partial<NotificationDto>) {
    Object.assign(this, partial);
  }
}
