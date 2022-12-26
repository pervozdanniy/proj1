import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  RawBodyRequest,
  createParamDecorator,
} from '@nestjs/common';
import { ClientService } from '../client.service';
import { Request } from 'express';

const storage = new Map<string, string>();

export const DecryptedData = createParamDecorator((prop: never, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const apiKey = req.header('api_key');
  if (!apiKey) {
    return undefined;
  }

  const data = storage.get(apiKey);
  if (data) {
    return JSON.parse(data);
  }

  return undefined;
});

@Injectable()
export class EncryptedGuard implements CanActivate {
  constructor(private readonly clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
    const apiKey = req.header('api_key');
    if (!apiKey) {
      throw new UnauthorizedException();
    }

    const encrypted = Buffer.from(req.rawBody.toString('utf8'), 'base64');
    const client = await this.clientService.validateEncrypted(encrypted, apiKey);
    if (!client) {
      throw new UnauthorizedException();
    }

    storage.set(apiKey, client.decrypted_data);

    return true;
  }
}
