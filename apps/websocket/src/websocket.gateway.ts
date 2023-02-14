import { UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WsException } from '@nestjs/websockets';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import { Server, Socket } from 'socket.io';
import { SessionProxy, sessionProxyFactory, SessionService } from '~common/session';
import { AllExceptionsFilter } from './utils/exception.filter';
import { bind, isBound } from './utils/session/helpers';
import { BoundSessionInterface } from './utils/session/interfaces';

type SocketSession = { session: SessionProxy<BoundSessionInterface> };

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

  constructor(private readonly jwt: JwtService, private readonly session: SessionService<BoundSessionInterface>) {}

  async handleDisconnect(client: WithSession<Socket>) {
    await client.data.session.reload();
    client.data.session.socketIds = client.data.session.socketIds.filter((id) => id !== client.id);
    await client.data.session.save();
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
      bind(proxy, socket.id);

      socket.data.session = proxy;
      socket.data.session.save();

      return next();
    });

    this.server = server;
  }

  async send(payload: { event: string; data?: any }, sessionId: string) {
    const session = await this.session.get(sessionId);
    if (isBound(session)) {
      this.server.to(session.socketIds).emit(payload.event, payload.data);
    }

    throw new Error('No websocket clients connected');
  }
}
