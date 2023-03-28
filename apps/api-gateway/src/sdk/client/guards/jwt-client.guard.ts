import { ConflictException, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatusEnum } from '~common/constants/user';
import { JwtSessionGuard as BaseGuard, SessionInterface, SessionMetadataOptions } from '~common/http-session';
import { JWT_AUTH_METADATA } from '~common/http-session/meta';
import { SdkPaymentGatewayService } from '../../payment-gateway/prime_trust/services/sdk-payment-gateway.service';

@Injectable()
export class JwtClientGuard extends BaseGuard {
  constructor(
    reflector: Reflector,

    private readonly sdkPaymentGatewayService: SdkPaymentGatewayService,
  ) {
    super(reflector);
  }

  protected async validateSession(session: SessionInterface, context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<SessionMetadataOptions>(JWT_AUTH_METADATA, context.getHandler());
    if (!options.allowUnauthorized && !session.user) {
      throw new UnauthorizedException();
    }
    if (options.requireKYC) {
      const contact = await this.sdkPaymentGatewayService.getContact({ id: session.user.id });
      if (!contact.identity_confirmed || !contact.proof_of_address_documents_verified || !contact.cip_cleared) {
        throw new ConflictException({ message: 'Please complete KYC verification!' });
      }
    }

    if (!options.allowClosed) {
      const { status } = await this.sdkPaymentGatewayService.getUserAccountStatus(session.user.id);
      if (status === UserStatusEnum.Closed) {
        throw new ConflictException({
          message:
            'Your account closed,you hav`nt permission for this action,please send email to support for reactivation!',
        });
      }
    }

    return true;
  }
}
