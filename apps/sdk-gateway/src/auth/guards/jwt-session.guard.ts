import { ConflictException, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtSessionGuard as BaseGuard, SessionInterface, SessionProxy } from '~common/http-session';
import { JWT_AUTH_METADATA } from '~common/http-session/meta';
import { PaymentGatewayService } from '../../payment-gateway/prime_trust/services/payment-gateway.service';
import { SessionMetadataOptions } from '../interfaces/session.interface';

@Injectable()
export class JwtSessionGuard extends BaseGuard {
  constructor(reflector: Reflector, private readonly paymentGatewayService: PaymentGatewayService) {
    super(reflector);
  }

  protected async validateSession(
    session: SessionProxy<SessionInterface<any>>,
    context: ExecutionContext,
  ): Promise<boolean> {
    const res = await super.validateSession(session, context);

    const options = this.reflector.get<SessionMetadataOptions>(JWT_AUTH_METADATA, context.getHandler());

    if (!options.allowUnauthorized && !session.user) {
      throw new UnauthorizedException();
    }

    if (options.requireKYC) {
      const contact = await this.paymentGatewayService.getContact({ id: session.user.id });
      if (!contact.identity_confirmed) {
        throw new ConflictException({ message: 'Please complete KYC verification!' });
      }
    }

    return res;
  }
}
