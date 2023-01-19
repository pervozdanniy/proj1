import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import util from 'node:util';
import { Repository } from 'typeorm';
import {
  AuthClient as AuthClientInterface,
  ClientCreateRequest,
  ClientLoginRequest,
  SignedRequest,
} from '~common/grpc/interfaces/auth';
import { AuthApiService } from '../api/services/api.service';
import { AuthClient } from '../entities/auth_client.entity';
import { isDerFormatted, isRaw, rawToDer } from './helpers/ed25519-public';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(AuthClient) private readonly authClientRepo: Repository<AuthClient>,
    private readonly authService: AuthApiService,
  ) {}

  async validate({ data, signature }: SignedRequest, apiKey: string): Promise<AuthClientInterface> {
    const client = await this.authClientRepo.findOneBy({ key: apiKey });
    if (!client) {
      throw new UnauthorizedException();
    }

    if (signature) {
      if (!client.secret) {
        throw new UnauthorizedException();
      }
      const publicKey = crypto.createPublicKey({
        key: Buffer.from(client.secret, 'hex'),
        format: 'der',
        type: 'spki',
      });
      if (!crypto.verify(null, data, publicKey, signature)) {
        throw new UnauthorizedException();
      }
    }

    return {
      name: client.name,
      key: client.key,
      is_secure: !!(signature && client.secret),
    };
  }

  async create({ name, pub_key }: ClientCreateRequest) {
    const secret = this.parsePublicKey(pub_key).toString('hex');
    const key = await util
      .promisify(crypto.randomBytes)(6)
      .then((buf) => buf.toString('hex'));

    return this.authClientRepo.save(this.authClientRepo.create({ name, key, secret }));
  }

  private parsePublicKey(hex: string): Buffer {
    const key = Buffer.from(hex, 'hex');
    if (isDerFormatted(key)) {
      return key;
    }

    if (isRaw(key)) {
      return rawToDer(key);
    }

    throw new BadRequestException({ message: ['Invalid pub_key format'] });
  }

  async login(payload: ClientLoginRequest, client: AuthClientInterface) {
    const user = await this.authService.findByLogin(payload.login);
    if (
      user &&
      user.source === client.name &&
      (client.is_secure || (await bcrypt.compare(payload.password, user.password)))
    ) {
      return this.authService.login(user);
    }

    throw new UnauthorizedException();
  }
}
