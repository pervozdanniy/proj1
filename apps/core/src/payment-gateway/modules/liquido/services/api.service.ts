import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { VeriffDocumentEntity } from '../../veriff/entities/veriff-document.entity';

type AuthToken = {
  accessToken: string;
  expiresAt: number;
};

const TIME_DIFF_MS = 10 * 1000 * 1000;

export class LiquidoApiService {
  #token?: AuthToken;

  private readonly client_id: string;
  private readonly secret: string;
  private readonly auth_url: string;
  private readonly x_api_key: string;
  private readonly api_url: string;

  constructor(private readonly httpService: HttpService, config: ConfigService<ConfigInterface>) {
    const { client_id, secret, auth_url, x_api_key, api_url } = config.get('liquido', { infer: true });
    this.client_id = client_id;
    this.secret = secret;
    this.auth_url = auth_url;
    this.x_api_key = x_api_key;
    this.api_url = api_url;
  }

  async authorize(): Promise<AuthToken> {
    const data = {
      client_id: this.client_id,
      client_secret: this.secret,
      grant_type: 'client_credentials',
    };
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const result = await lastValueFrom(this.httpService.post(`${this.auth_url}/oauth2/token`, data, { headers }));

    return {
      accessToken: result.data.access_token,
      expiresAt: Date.now() + result.data.expires_in * 1000 - TIME_DIFF_MS,
    };
  }

  private async ensureAuth(force = false) {
    if (!force && this.#token?.expiresAt > Date.now()) {
    } else {
      this.#token = await this.authorize();
    }

    return `Bearer ${this.#token.accessToken}`;
  }

  async createPaymentLink(
    amountOut: number,
    currency_type: string,
    userDetails: UserEntity,
    document: VeriffDocumentEntity,
    callbackUrl: string,
  ): Promise<{ orderId: string; url: string }> {
    const token = await this.ensureAuth();
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: token,
      'x-api-key': this.x_api_key,
    };
    const orderId = await uid(18);
    const formData = {
      orderId: orderId,
      amount: amountOut,
      currency: currency_type,
      country: userDetails.country_code,
      allowPaymentMethods: ['PAY_CASH'],
      name: userDetails.details.first_name,
      email: userDetails.email,
      phone: userDetails.phone,
      documentId: document.person_id_number,
      callbackUrl,
      description: 'this is a test payment',
    };

    const result = await lastValueFrom(
      this.httpService.post(`${this.api_url}/v2/cashier/payment-link/`, formData, { headers: headersRequest }),
    );

    return {
      orderId,
      url: result.data.paymentLink,
    };
  }
}
