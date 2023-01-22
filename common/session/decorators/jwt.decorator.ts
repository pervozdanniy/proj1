import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiPreconditionFailedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JWT_AUTH_METADATA } from '../constants/meta';
import { JwtSessionGuard } from '../guards/jwt/jwt.guard';
import { JwtAuthenticatedRequest, JwtAuthentication } from '../interfaces/auth.interface';
import { SessionMetadataOptions } from '../interfaces/session.interface';

export const JwtSession = createParamDecorator((prop: keyof JwtAuthentication | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<JwtAuthenticatedRequest>();
  if (prop) {
    return request.user?.[prop];
  }

  return request.user;
});

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
