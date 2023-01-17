import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AddNotificationRequest,
  NotifierServiceController,
  NotifierServiceControllerMethods,
} from '~common/grpc/interfaces/notifier';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { NotificationService } from './notification.service';

@RpcController()
@NotifierServiceControllerMethods()
export class NotificationController implements NotifierServiceController {
  constructor(private readonly notificationService: NotificationService) {}

  add(request: AddNotificationRequest): Promise<SuccessResponse> {
    return this.notificationService.add(request);
  }
}
