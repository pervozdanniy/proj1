import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAuthenticatedRequest, JwtAuthentication } from '../interfaces/auth.interface';

export const JwtSessionAuth = createParamDecorator(
  (prop: keyof JwtAuthentication | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<JwtAuthenticatedRequest>();
    if (prop) {
      return request.user?.[prop];
    }

    return request.user;
  },
);

export const JwtSessionUser = () => JwtSessionAuth('user');

export const JwtSessionId = () => JwtSessionAuth('sessionId');
