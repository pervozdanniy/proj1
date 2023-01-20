import { TestingModule } from '@nestjs/testing';
import { AddNotificationRequest } from '~common/grpc/interfaces/notifier';
import createNotifier from '~svc/api-gateway/test/notifier/__mocks/notifier.app';
import { redisStorage } from '~svc/api-gateway/test/__mocks/redis';
import { userStorage } from '~svc/api-gateway/test/__mocks/user.repository';
import { NotificationService } from '~svc/notifier/src/notification.service';

describe('NotifierService (e2e)', () => {
  let notifier: TestingModule;
  let notificationService: NotificationService;

  const notifierData: AddNotificationRequest = {
    notification: {
      title: 'Test notification',
      description: 'Test description',
    },
    user_data: {
      username: 'test',
      email: 'test@gmail.com',
      phone: '+37499000000',
      send_type: 1,
    },
  };

  beforeAll(async () => {
    notifier = await createNotifier();

    notificationService = notifier.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    redisStorage.clear();
    userStorage.length = 0;
  });

  it('should be defined', () => {
    expect(notificationService).toBeDefined();
  });

  it('add notification', async () => {
    jest.spyOn(notificationService, 'add').mockImplementation(() => Promise.resolve({ success: true }));
    expect(await notificationService.add(notifierData)).toEqual({ success: true });
  });

  afterAll(async () => {
    await notifier.close();
  });
});
