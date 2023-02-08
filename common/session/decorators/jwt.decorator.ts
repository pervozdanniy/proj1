import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
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

    return request.session;
  },
);

export const JwtSessionUser = () => JwtSession('user');

export const JwtSessionId = () => JwtSession('sessionId');

export const JwtSessionAuth = (options: SessionMetadataOptions = {}) =>
  applyDecorators(
    SetMetadata(JWT_AUTH_METADATA, options),
    UseGuards(JwtSessionGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
