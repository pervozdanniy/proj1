import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { WebSocketService } from './web-socket.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('websocket')])],
  providers: [WebSocketService],
})
export class WebSocketModule {}
