import { Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { WebsocketServiceClient } from '~common/grpc/interfaces/websocket';

@Injectable()
export class WebSocketService {
  private webSocketClient: WebsocketServiceClient;
  constructor(@InjectGrpc('websocket') private readonly client: ClientGrpc) {}
  onModuleInit() {
    this.webSocketClient = this.client.getService('WebsocketService');
  }

  send(event: string, data: string): Promise<SuccessResponse> {
    return firstValueFrom(this.webSocketClient.send({ event, data }));
  }

  sendTo(message: { event: string; data?: string }, user_id: number) {
    return firstValueFrom(this.webSocketClient.sendTo({ message, user_id }));
  }
}
