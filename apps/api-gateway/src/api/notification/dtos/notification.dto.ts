import { ApiProperty } from '@nestjs/swagger';
import { Notification, NotificationListResponse } from '~common/grpc/interfaces/notification';

export class NotificationDto implements Notification {
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
}

export class NotificationListDto implements NotificationListResponse {
  @ApiProperty()
  has_more: boolean;
  @ApiProperty()
  last_id: number | undefined;
  @ApiProperty()
  notifications: Notification[];
}
