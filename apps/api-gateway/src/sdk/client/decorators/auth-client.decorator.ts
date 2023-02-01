import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { WithAuthClient } from '../guards/auth-client.guard';

export const AuthClient = createParamDecorator((prop: never, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<WithAuthClient<Request>>();

  return req.authClient;
});
