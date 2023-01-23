import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { TwoFactorCode } from '~common/grpc/interfaces/auth';

@Injectable()
export class Notifier2FAService {
  private readonly logger = new Logger(Notifier2FAService.name);

  send(codes: TwoFactorCode[], userId: number): void {
    this.logger.debug('2FA codes:', { userId, codes });
  }
}
