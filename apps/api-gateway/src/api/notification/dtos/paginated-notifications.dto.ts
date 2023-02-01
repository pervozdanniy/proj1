import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NotificationDto } from '~svc/api-gateway/src/api/notification/dtos/notification.dto';

export class PaginatedNotificationsDto {
  @ApiProperty({ description: 'Notifications list.', type: NotificationDto, isArray: true })
  @Type(() => NotificationDto)
  items: NotificationDto[];

  @ApiProperty({ description: 'The whole count.' })
  @Type(() => Number)
  count: number;

  constructor(partial: Partial<PaginatedNotificationsDto>) {
    Object.assign(this, partial);
  }
}
