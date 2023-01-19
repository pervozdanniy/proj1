import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtSessionGuard extends AuthGuard('jwt-session') {
  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    console.log('HANDLE', err, user, info, status);

    return super.handleRequest(err, user, info, context, status);
  }
}
