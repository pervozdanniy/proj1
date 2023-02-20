import { applyDecorators, HttpStatus, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtSession, JwtSessionId, JwtSessionUser } from '~common/http-session';
import { JWT_AUTH_METADATA } from '~common/http-session/meta';
import { TwoFactorRequiredResponseDto } from '../dto/2fa.reponse.dto';
import { JwtSessionGuard } from '../guards/jwt-session.guard';
import { SessionMetadataOptions } from '../interfaces/session.interface';

const JwtSessionAuth = (options: SessionMetadataOptions = {}) => {
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
  if (options.requirePasswordReset) {
    decorators.push(ApiConflictResponse({ description: "You haven't started password reset process" }));
  }

  return applyDecorators(...decorators);
};

export { JwtSession, JwtSessionAuth, JwtSessionId, JwtSessionUser };
