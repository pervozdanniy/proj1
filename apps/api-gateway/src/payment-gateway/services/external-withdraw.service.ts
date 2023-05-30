import { Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common/interfaces';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { ExternalWithdrawAuthorizationServiceClient } from '~common/grpc/interfaces/inswitch';

@Injectable()
export class ExternalWithdrawService implements OnModuleInit {
  private withdraw: ExternalWithdrawAuthorizationServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.withdraw = this.client.getService('ExternalWithdrawAuthorizationService');
  }

  authorize(payload: Buffer) {
    return firstValueFrom(this.withdraw.authorize({ payload }));
  }

  async update(authorizationId: string, payload: Buffer) {
    await firstValueFrom(this.withdraw.update({ authorization_id: authorizationId, payload }));
  }
}
