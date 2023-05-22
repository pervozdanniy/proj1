import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { ExternalBalanceServiceClient } from '~common/grpc/interfaces/inswitch';

export class ExternalBalanceService {
  private balanceClient: ExternalBalanceServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.balanceClient = this.client.getService('ExternalBalanceService');
  }

  getBalance(userId: number) {
    return firstValueFrom(this.balanceClient.getBalance({ user_id: userId }));
  }
}
