import { UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WsException } from '@nestjs/websockets';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import { Server, Socket } from 'socket.io';
import { SessionProxy, SessionService } from '~common/session';
import { AllExceptionsFilter } from './utils/exception.filter';

type SocketSession = { session: SessionProxy };

type WithSession<T> = T extends Server<infer L, infer E, infer S>
  ? Server<L, E, S, SocketSession>
  : T extends Socket<infer L, infer E, infer S>
  ? Socket<L, E, S, SocketSession>
  : never;

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@UseFilters(AllExceptionsFilter)
export class WebsocketGateway implements OnGatewayInit, OnGatewayDisconnect {
  private server: WithSession<Server>;
  private readonly sockets = new Map<number, string>();

  constructor(private readonly jwt: JwtService, private readonly session: SessionService) {}

  handleDisconnect(client: WithSession<Socket>) {
    client.data.session.user && this.sockets.delete(client.data.session.user.id);
  }

  afterInit(server: WithSession<Server>) {
    server.use(async (socket, next) => {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(socket.handshake as any);

      if (!token) {
        return next(new WsException('Authentication Error'));
      }

      let payload: JwtPayload;
      try {
        payload = await this.jwt.verifyAsync(token);
      } catch (err) {
        return next(new WsException(err.message));
      }

      const proxy = await this.session.get(payload.sub);

      if (!proxy.user) {
        return next(new WsException('Unauthorized'));
      }
      this.sockets.set(proxy.user.id, socket.id);
      socket.data.session = proxy;

      return next();
    });

    this.server = server;
  }

  async send(payload: { event: string; data?: any }, sessionId: string) {
    const session = await this.session.get(sessionId);

    return this.sendTo(payload, session.user.id);
  }

  sendTo(payload: { event: string; data?: any }, userId: number) {
    const socketId = this.sockets.get(userId);
    if (!socketId) {
      throw new Error('No websocket clients connected');
    }

    return this.server.to(socketId).emit(payload.event, payload.data);
  }
}
