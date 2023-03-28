import {
  Notification,
  NotificationListResponse,
  NotificationRequest,
  NotificationServiceController,
  NotificationServiceControllerMethods,
  UpdateNotificationRequest,
} from '~common/grpc/interfaces/notification';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { NotificationService } from '../services/notification.service';

@RpcController()
@NotificationServiceControllerMethods()
export class NotificationController implements NotificationServiceController {
  constructor(private notificationService: NotificationService) {}

  list(request: NotificationRequest): Promise<NotificationListResponse> {
    return this.notificationService.list(request);
  }

  update(request: UpdateNotificationRequest): Promise<Notification> {
    return this.notificationService.update(request);
  }
}
