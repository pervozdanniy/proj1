import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { EventWebhook, KYCServiceClient } from '~common/grpc/interfaces/veriff';
import { DecisionWebhookDto } from '../dtos/kyc/kyc-webhook.dto';

@Injectable()
export class KYCService implements OnModuleInit {
  private kyc: KYCServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.kyc = this.client.getService('KYCService');
  }

  generateLink(userId: number) {
    return lastValueFrom(this.kyc.generateLink({ user_id: userId }));
  }

  async decisionHandler(data: DecisionWebhookDto) {
    await lastValueFrom(this.kyc.decisionHandler(data));
  }

  async eventHandler(data: EventWebhook) {
    await lastValueFrom(this.kyc.eventHandler(data));
  }
}
