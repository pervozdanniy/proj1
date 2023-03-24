import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { SessionProxy } from '~common/grpc-session';
import { InjectGrpc } from '~common/grpc/helpers';
import { RegisterStartRequest } from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';
import { CreateRequest, UpdateRequest, UserServiceClient } from '~common/grpc/interfaces/core';
import { CreateNotificationRequest, NotificationServiceClient } from '~common/grpc/interfaces/notification';
import { AgreementRequest, PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);
  private userService: UserServiceClient;
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  private notifierService: NotificationServiceClient;
  constructor(@InjectGrpc('core') private readonly client: ClientGrpc, private readonly jwt: JwtService) {}

  onModuleInit() {
    this.userService = this.client.getService('UserService');
    this.paymentGatewayServiceClient = this.client.getService('PaymentGatewayService');
    this.notifierService = this.client.getService('NotificationService');
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

  async findByEmail(email: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ email }));

    return user;
  }

  async findByPhone(phone: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ phone }));

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

  async createAgreement(payload: AgreementRequest) {
    return firstValueFrom(this.paymentGatewayServiceClient.createAgreement(payload));
  }

  async updateUser(payload: UpdateRequest) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    return firstValueFrom(this.userService.update(payload));
  }

  login(user: User, session: SessionProxy) {
    session.user = user;

    return this.generateToken(session.id);
  }

  generateToken(sessionId: string) {
    return this.jwt.signAsync({ sub: sessionId });
  }

  async getUserById(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  async sendNotification(payload: CreateNotificationRequest) {
    console.log(payload);

    return firstValueFrom(this.notifierService.createAsync(payload));
  }
}
