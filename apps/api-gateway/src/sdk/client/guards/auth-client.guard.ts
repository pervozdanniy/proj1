import { CanActivate, ExecutionContext, Injectable, RawBodyRequest, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Buffer } from 'node:buffer';
import { AuthClient } from '~common/grpc/interfaces/auth';
import { ClientService } from '../client.service';

export type WithAuthClient<T> = T & { authClient?: AuthClient };

@Injectable()
export class AuthClientGuard implements CanActivate {
  constructor(private readonly clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<WithAuthClient<RawBodyRequest<Request>>>();
    const apiKey = req.header('api-key');
    const signature = req.header('signature');

    if (!apiKey) {
      throw new UnauthorizedException();
    }

    const client = await this.clientService.validate(
      { data: req.rawBody, signature: signature ? Buffer.from(signature, 'hex') : undefined },
      apiKey,
    );

    if (!client) {
      throw new UnauthorizedException();
    }
    req.authClient = client;
    req.body.secure = client.is_secure;

    return true;
  }
}
