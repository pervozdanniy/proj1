import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthClient } from '../entities/auth_client.entity';
import crypto from 'node:crypto';
import util from 'node:util';
import { ClientCreateRequest } from '~common/grpc/interfaces/auth';
import { AuthApiService } from '../api/api.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(AuthClient) private readonly authClientRepo: Repository<AuthClient>,
    private readonly authService: AuthApiService,
  ) {}

  async validate(apiKey: string) {
    const client = await this.authClientRepo.findOneBy({ key: apiKey });
    if (!client) {
      throw new UnauthorizedException();
    }

    return client;
  }

  async validateEncrypted(apiKey: string, encryptedData: Uint8Array) {
    const client = await this.authClientRepo.findOneBy({ key: apiKey });
    if (!client?.secret) {
      throw new UnauthorizedException();
    }
    const data = crypto.publicDecrypt(client.secret, encryptedData).toString('utf8');

    return {
      name: client.name,
      key: client.key,
      decrypted_data: data,
    };
  }

  async create({ name, pub_key }: ClientCreateRequest) {
    const key = await util
      .promisify(crypto.randomBytes)(6)
      .then((buf) => buf.toString('hex'));

    return this.authClientRepo.save(this.authClientRepo.create({ name, key, secret: pub_key }));
  }

  async login(login: string) {
    const user = await this.authService.findByLogin(login);
    console.log('AUTH_CLIENT', user, login);

    return this.authService.login(user);
  }
}
