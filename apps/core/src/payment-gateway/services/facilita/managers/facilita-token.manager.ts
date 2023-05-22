import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class FacilitaTokenManager {
  private readonly url: string;
  private readonly username: string;
  private readonly password: string;
  constructor(private readonly httpService: HttpService, config: ConfigService<ConfigInterface>) {
    const { facilita_url } = config.get('app', { infer: true });
    const { username, password } = config.get('facilita', { infer: true });
    this.url = facilita_url;
    this.username = username;
    this.password = password;
  }

  async getToken(): Promise<{ token: string }> {
    const data = {
      user: {
        username: this.username,
        password: this.password,
      },
    };
    const result = await lastValueFrom(this.httpService.post(`${this.url}/api/v1/sign_in`, data));
    if (result.data) {
      return { token: result.data.jwt };
    }
  }
}
