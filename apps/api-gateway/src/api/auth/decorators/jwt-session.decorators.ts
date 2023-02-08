import { applyDecorators, HttpStatus, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { With2FA } from '~common/constants/auth/2fa/interfaces';
import { WithPreRegistration } from '~common/constants/auth/registration/interfaces';
import { JwtSession, JwtSessionId, JwtSessionUser, SessionMetadataOptions } from '~common/session';
import { JWT_AUTH_METADATA } from '~common/session/constants/meta';
import { TwoFactorRequiredResponseDto } from '../dto/2fa.reponse.dto';
import { JwtSessionGuard } from '../guards/jwt-session.guard';

const JwtSessionAuth = (options: WithPreRegistration<With2FA<SessionMetadataOptions>> = {}) => {
  const decorators: Parameters<typeof applyDecorators> = [
    SetMetadata(JWT_AUTH_METADATA, options),
    UseGuards(JwtSessionGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];

  if (!options.allowUnverified) {
    decorators.push(ApiPreconditionFailedResponse({ description: 'Verification is not completed' }));
  }
  if (options.require2FA) {
    decorators.push(
      ApiResponse({
        status: HttpStatus.PRECONDITION_REQUIRED,
        type: TwoFactorRequiredResponseDto,
        description: 'Verification required',
      }),
      ApiConflictResponse({ description: 'No verification methods are enabled' }),
    );
  }
  if (options.requirePreRegistration) {
    decorators.push(ApiConflictResponse({ description: "You haven't started registration process" }));
  }

  return applyDecorators(...decorators);
};

export { JwtSession, JwtSessionAuth, JwtSessionId, JwtSessionUser };
