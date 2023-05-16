import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { SessionProxy, SessionService } from '~common/grpc-session';
import { InjectGrpc } from '~common/grpc/helpers';
import { RegisterStartRequest } from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';
import { CreateRequest, UpdateRequest, UserServiceClient } from '~common/grpc/interfaces/core';
import { NotifierServiceClient, NotifyRequest, SendType } from '~common/grpc/interfaces/notifier';
import { AgreementRequest, PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { TokenService } from './token.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);
  private userService: UserServiceClient;
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  private notifierService: NotifierServiceClient;
  constructor(
    @InjectGrpc('notifier') private readonly notifierClient: ClientGrpc,
    @InjectGrpc('core') private readonly coreClient: ClientGrpc,
    private readonly token: TokenService,
    private readonly session: SessionService,
  ) {}

  onModuleInit() {
    this.userService = this.coreClient.getService('UserService');
    this.paymentGatewayServiceClient = this.coreClient.getService('PaymentGatewayService');
    this.notifierService = this.notifierClient.getService('NotifierService');
  }

  async validateUser(login: string, pass: string): Promise<User | null> {
    let user: User | undefined;
    try {
      user = await this.findByEmail(login);
    } catch (error) {
      this.logger.error('Validate user: ', error.stack, { error });
    }
    if (user) {
      const isEq = await bcrypt.compare(pass, user.password);
      if (isEq) {
        delete user.password;

        return user;
      }
    }

    return null;
  }

  async findByLogin(payload: { email?: string; phone?: string }) {
    const { user } = await firstValueFrom(this.userService.findByLogin(payload));

    return user;
  }

  async findByEmail(email: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ email }));

    return user;
  }

  async findByPhone(phone: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ phone }));

    return user;
  }

  async findBySocialId(socialId: string) {
    const { user } = await firstValueFrom(this.userService.findBySocialId({ social_id: socialId }));

    return user;
  }

  async findUser(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkIfUnique({ password, ...payload }: RegisterStartRequest) {
    const { success } = await firstValueFrom(this.userService.checkIfUnique(payload));

    return success;
  }

  async createUser(payload: CreateRequest) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    return firstValueFrom(this.userService.create(payload));
  }

  async updateUser(payload: UpdateRequest) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    return firstValueFrom(this.userService.update(payload));
  }

  async createAgreement(payload: AgreementRequest) {
    return firstValueFrom(this.paymentGatewayServiceClient.createAgreement(payload));
  }

  login(user: User, session: SessionProxy) {
    session.user = user;

    return this.generateToken(session.id);
  }

  generateToken(sessionId: string) {
    return this.token.generatePair(sessionId);
  }

  async refreshToken(refreshToken: string) {
    const { sessionId, tokens } = await this.token.refresh(refreshToken);
    const proxy = await this.session.get(sessionId);
    const valid = await proxy.touch();
    if (!valid) {
      throw new UnauthorizedException('Session expired');
    }

    return tokens;
  }

  validateToken(accessToken: string) {
    return this.token.extractSessionId(accessToken);
  }

  async getUserById(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  async sendNotification(email: string, { title, body }: NotifyRequest) {
    return firstValueFrom(
      this.notifierService.add({
        notification: { title, body },
        options: { send_type: SendType.SEND_TYPE_EMAIL, email },
      }),
    );
  }
}
