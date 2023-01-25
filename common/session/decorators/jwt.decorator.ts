import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiPreconditionFailedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JWT_AUTH_METADATA } from '../constants/meta';
import { JwtSessionGuard } from '../guards/jwt.guard';
import { SessionInterface, SessionMetadataOptions, WithSession } from '../interfaces/session.interface';
import { SessionProxy } from '../session-host';

export const JwtSession = createParamDecorator(
  (prop: keyof SessionProxy<SessionInterface> | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<WithSession<Request>>();
    if (prop) {
      return request.session?.[prop];
    }

    return request.user;
  },
);

export const JwtSessionUser = () => JwtSession('user');

export const JwtSessionId = () => JwtSession('sessionId');

export const JwtSessionAuth = (options: SessionMetadataOptions = { allowUnverified: false }) => {
  const decorators: Parameters<typeof applyDecorators> = [
    SetMetadata(JWT_AUTH_METADATA, options),
    UseGuards(JwtSessionGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];
  if (!options.allowUnverified) {
    decorators.push(ApiPreconditionFailedResponse({ description: '2FA is not completed' }));
  }

  return applyDecorators(...decorators);
};
