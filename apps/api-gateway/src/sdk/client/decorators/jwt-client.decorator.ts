import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtSession, JwtSessionId, JwtSessionUser, SessionMetadataOptions } from '~common/http-session';
import { JWT_AUTH_METADATA } from '~common/http-session/meta';
import { JwtClientGuard } from '../guards/jwt-client.guard';

const JwtSessionAuth = (options: SessionMetadataOptions = {}) => {
  const decorators: Parameters<typeof applyDecorators> = [
    SetMetadata(JWT_AUTH_METADATA, options),
    UseGuards(JwtClientGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];

  return applyDecorators(...decorators);
};

export { JwtSession, JwtSessionAuth, JwtSessionId, JwtSessionUser };
