import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayInit, WebSocketGateway, WsException } from '@nestjs/websockets';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { SessionInterface, SessionService } from '~common/session';
import { isAuthenticated } from '~common/session/helpers';
import { bind, isBound } from './utils/session/helpers';
import { BoundSessionInterface } from './utils/session/interfaces';

type ServerWithSession = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { session: BoundSessionInterface; sessionId: string }
>;

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebsocketGateway implements OnGatewayInit {
  private server: ServerWithSession;

  constructor(
    private readonly jwt: JwtService,
    private readonly session: SessionService<SessionInterface | BoundSessionInterface>,
  ) {}

  afterInit(server: ServerWithSession) {
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
      const session = await this.session.get(payload.sub);

      if (isAuthenticated(session)) {
        const bound = bind(session, socket.id);
        socket.data.session = bound;
        socket.data.sessionId = payload.sub;

        await this.session.set(payload.sub, bound);

        return next();
      }

      return next(new WsException('Authentication Error'));
    });

    this.server = server;
  }

  async sendHello(sessionId: string) {
    const session = await this.session.get(sessionId);
    if (isBound(session)) {
      this.server.to(session.socketId).emit('hello', session.user.username);
    }
  }

  async send(payload: { event: string; data?: any }, sessionId: string) {
    const session = await this.session.get(sessionId);
    if (isBound(session)) {
      this.server.to(session.socketId).emit(payload.event, payload.data);
    }

    throw new UnauthorizedException();
  }
}
