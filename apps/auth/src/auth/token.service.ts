import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import jwt, { JwtPayload, Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { promisify } from 'node:util';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class TokenService {
  #sign = promisify<JwtPayload | string | Buffer, Secret, SignOptions, string>(jwt.sign);
  #verify = promisify<string, string, VerifyOptions, JwtPayload>(jwt.verify);

  private readonly config: ConfigInterface['auth']['jwt'];

  constructor(
    config: ConfigService<ConfigInterface>,
    @InjectRepository(RefreshTokenEntity) private readonly tokenRepo: Repository<RefreshTokenEntity>,
  ) {
    this.config = config.get('auth.jwt', { infer: true });
  }

  async generatePair(sessionId: string) {
    const access_token = await this.#sign({ sub: sessionId }, this.config.secret, {
      expiresIn: this.config.accessTokenTtl,
    });
    const { identifiers } = await this.tokenRepo.insert({ family: sessionId });
    const refresh_token = await this.#sign({ iss: sessionId, sub: identifiers[0].id }, this.config.secret, {
      expiresIn: this.config.refreshTokenTtl,
    });

    return { access_token, refresh_token };
  }

  async extractSessionId(accessOrRefresh: string) {
    const payload = await this.#verify(accessOrRefresh, this.config.secret, {});

    return payload.iss ?? payload.sub;
  }

  async refresh(refreshToken: string) {
    const payload = await this.#verify(refreshToken, this.config.secret, {});
    if (!payload.iss) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { affected } = await this.tokenRepo.delete(payload.sub);
    if (affected <= 0) {
      await this.tokenRepo.delete({ family: payload.iss });

      throw new ForbiddenException('Token was already used');
    }

    return this.generatePair(payload.iss);
  }

  async revoke(sessionId: string) {
    await this.tokenRepo.delete({ family: sessionId });
  }
}
