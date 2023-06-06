import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { FacilitaTokenManager } from './facilita-token.manager';

@Injectable()
export class FacilitaMainManager {
  private readonly url: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly facilitaTokenManager: FacilitaTokenManager,
    config: ConfigService<ConfigInterface>,
  ) {
    const { facilita_url } = config.get('app', { infer: true });
    this.url = facilita_url;
  }

  async countBrazilRate() {
    const { token } = await this.facilitaTokenManager.getToken();
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    const rateResult = await lastValueFrom(
      this.httpService.get(`${this.url}/api/v1/exchange_rates`, { headers: headersRequest }),
    );

    return {
      brlusdspot: Number(rateResult.data.data.brlusdspot),
      brlusd: Number(rateResult.data.data.brlusd),
      usdbrl: Number(rateResult.data.data.usdbrl),
    };
  }
}
