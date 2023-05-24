import {
  ConflictException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserSourceEnum, UserStatusEnum } from '~common/constants/user';
import { User } from '~common/grpc/interfaces/common';
import {
  is2FA,
  isPasswordReset,
  isRegistration,
  JwtSessionGuard as BaseGuard,
  SessionInterface,
  SessionProxy,
} from '~common/http-session';
import { JWT_AUTH_METADATA } from '~common/http-session/meta';
import { PaymentGatewayService } from '../../payment-gateway/services/payment-gateway.service';
import { SessionMetadataOptions } from '../interfaces/session.interface';
import { TwoFactorService } from '../services/2fa.service';

@Injectable()
export class JwtSessionGuard extends BaseGuard {
  constructor(
    reflector: Reflector,
    private readonly twoFactor: TwoFactorService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {
    super(reflector);
  }

  protected async validateSession(
    session: SessionProxy<SessionInterface<User>>,
    context: ExecutionContext,
  ): Promise<boolean> {
    const res = await super.validateSession(session, context);

    const options = this.reflector.get<SessionMetadataOptions>(JWT_AUTH_METADATA, context.getHandler());

    if (!options.allowUnauthorized && !session.user) {
      throw new UnauthorizedException();
    }
    if (!options.allowUnverified && is2FA(session) && !session.twoFactor.isVerified) {
      throw new PreconditionFailedException('Verification is not completed');
    }
    if (options.require2FA && !is2FA(session)) {
      const { error, required } = await this.twoFactor.require(session.id);
      if (error) {
        throw new ConflictException(error);
      }

      throw new HttpException(
        { message: 'Verification required', methods: required.methods },
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }
    if (options.forbidSocial && session.user.source !== UserSourceEnum.Api) {
      throw new ConflictException({ message: `This action unavailable for users were registered via social network!` });
    }

    if (options.requireRegistration && !isRegistration(session)) {
      throw new ConflictException({ message: "You haven't started registration process" });
    }
    if (options.requirePasswordReset && !isPasswordReset(session)) {
      throw new ConflictException({ message: "You haven't started password reset process" });
    }

    if (options.requireKYC) {
      const contact = await this.paymentGatewayService.getContact({ id: session.user.id });
      if (!contact.identity_confirmed) {
        throw new ConflictException({ message: 'Please complete KYC verification!' });
      }
    }

    if (!options.allowClosed) {
      const { status } = await this.paymentGatewayService.getUserAccountStatus(session.user.id);
      if (status === UserStatusEnum.Closed) {
        throw new ConflictException({
          message:
            "Your account closed, you don't have permission for this action, please send email to support for reactivation!",
        });
      }
    }

    return res;
  }
}
