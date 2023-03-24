import { Metadata } from '@grpc/grpc-js';
import { GrpcSessionAuth } from '~common/grpc-session';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  WebsocketServiceController,
  WebsocketServiceControllerMethods,
  WsMessage,
  WsUserMessage,
} from '~common/grpc/interfaces/websocket';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { WebsocketGateway } from './websocket.gateway';

@RpcController()
@WebsocketServiceControllerMethods()
export class WebsocketController implements WebsocketServiceController {
  constructor(private readonly ws: WebsocketGateway) {}

  @GrpcSessionAuth()
  async send(payload: WsMessage, metadata: Metadata): Promise<SuccessResponse> {
    const [sessionId] = metadata.get('sessionId');

    try {
      await this.ws.send(payload, sessionId.toString());
    } catch (error) {
      return { success: false, error: error.message?.toString() };
    }

    return { success: true };
  }

  async sendTo({ user_id, message }: WsUserMessage): Promise<SuccessResponse> {
    try {
      this.ws.sendTo(message, user_id);
    } catch (error) {
      return { success: false, error: error.message?.toString() };
    }

    return { success: true };
  }
}
