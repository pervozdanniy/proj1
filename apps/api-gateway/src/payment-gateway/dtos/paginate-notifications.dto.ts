import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NotificationListResponse } from '~common/grpc/interfaces/payment-gateway';
import { NotificationDto } from '~svc/api-gateway/src/payment-gateway/dtos/notification.dto';

export class PaginateNotificationsDto {
  @ApiProperty({ description: 'Notifications list.', type: NotificationDto, isArray: true })
  @Type(() => NotificationDto)
  items: NotificationDto[];

  @ApiProperty({ description: 'The whole count.' })
  count: number;

  constructor(partial: Partial<NotificationListResponse>) {
    Object.assign(this, partial);
  }
}
