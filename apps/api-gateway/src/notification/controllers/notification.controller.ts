import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { ListNotificationsDto } from '~svc/api-gateway/src/notification/dtos/list-notifications.dto';
import { NotificationDto } from '~svc/api-gateway/src/notification/dtos/notification.dto';
import { PaginatedNotificationsDto } from '~svc/api-gateway/src/notification/dtos/paginated-notifications.dto';
import { UpdateNotificationDto } from '~svc/api-gateway/src/notification/dtos/update-notification.dto';
import { NotificationService } from '~svc/api-gateway/src/notification/services/notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'notifications',
})
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get list of notifications' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedNotificationsDto })
  @HttpCode(HttpStatus.OK)
  @JwtSessionAuth()
  @Get('/list')
  list(@JwtSessionUser() { id }: User, @Query() query: ListNotificationsDto) {
    return this.notificationService.list({ id, ...query });
  }

  @ApiOperation({ summary: 'Update current user password.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification updated successfully.',
    type: NotificationDto,
  })
  @HttpCode(HttpStatus.OK)
  @JwtSessionAuth()
  @Put('/')
  update(@JwtSessionUser() { id }: User, @Body() payload: UpdateNotificationDto) {
    return this.notificationService.update({ id, payload });
  }
}
