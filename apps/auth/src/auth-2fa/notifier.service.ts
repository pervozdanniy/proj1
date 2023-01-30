import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { OnModuleInit } from '@nestjs/common/interfaces';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TwoFactorConstraint } from '~common/constants/auth';
import { InjectGrpc } from '~common/grpc/helpers';
import { NotifierServiceClient, NotifyOptions, SendType } from '~common/grpc/interfaces/notifier';
import { TwoFactorMethod } from '../entities/2fa_settings.entity';

const constraintToOptions = ({ method, destination }: TwoFactorConstraint): NotifyOptions => {
  switch (method) {
    case TwoFactorMethod.Email:
      return { send_type: SendType.SEND_TYPE_EMAIL, email: destination };
    case TwoFactorMethod.Sms:
      return { send_type: SendType.SEND_TYPE_SMS, phone: destination };
    default:
      return { send_type: SendType.SEND_TYPE_UNSPECIFIED };
  }
};

@Injectable()
export class Notifier2FAService implements OnModuleInit {
  private readonly logger = new Logger(Notifier2FAService.name);

  private notifier: NotifierServiceClient;

  constructor(@InjectGrpc('notifier') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.notifier = this.client.getService('NotifierService');
  }

  async send(constraints: TwoFactorConstraint[], userId: number) {
    this.logger.debug('2FA codes:', { userId, codes: constraints });
    const prs = constraints.map((c) =>
      firstValueFrom(
        this.notifier.add({
          notification: { title: 'Your 2FA code', body: c.code.toString() },
          options: constraintToOptions(c),
        }),
      ),
    );

    try {
      await Promise.all(prs);
    } catch (error) {
      this.logger.error('Sending 2FA codes failed: ', error.stack, { error, userId });
    }
  }
}
