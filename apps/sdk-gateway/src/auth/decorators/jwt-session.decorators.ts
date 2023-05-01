import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtSession, JwtSessionId, JwtSessionUser } from '~common/http-session';
import { JWT_AUTH_METADATA } from '~common/http-session/meta';
import { JwtSessionGuard } from '../guards/jwt-session.guard';
import { SessionMetadataOptions } from '../interfaces/session.interface';

const JwtSessionAuth = (options: SessionMetadataOptions = {}) => {
  const decorators: Parameters<typeof applyDecorators> = [
    SetMetadata(JWT_AUTH_METADATA, options),
    UseGuards(JwtSessionGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];

  return applyDecorators(...decorators);
};

export { JwtSession, JwtSessionAuth, JwtSessionId, JwtSessionUser };
