import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { URL } from 'node:url';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import {
  CreateEntityResponse,
  CreatePaymentMethodResponse,
  CreateWalletResponse,
  GetPaymentMethodsRequest,
  GetPaymentMethodsResponse,
  TokenResponse,
  TransactionRequest,
  TransactionResponse,
} from './api.interface';

type AuthToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
};

@Injectable()
export class InswitchApiService {
  #token?: AuthToken;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly authData: { username: string; password: string };
  private readonly webhookUrl: string;

  constructor(private readonly http: HttpService, config: ConfigService<ConfigInterface>) {
    this.webhookUrl = new URL('webhook/inswitch', config.get('app.domain', { infer: true })).toString();
    const { url, apiKey, username, password } = config.get('inswitch', { infer: true });
    this.apiKey = apiKey;
    this.baseUrl = url;
    this.authData = { username, password };
  }

  private async authorize(refreshToken?: string): Promise<AuthToken> {
    const data = new FormData();
    if (refreshToken) {
      data.append('refresh_token', refreshToken);
    } else {
      data.append('grant_type', 'password');
      data.append('username', this.authData.username);
      data.append('password', this.authData.password);
    }

    const resp = await lastValueFrom(
      this.http.post<TokenResponse>(
        new URL('auth-service/1.0/protocol/openid-connect/token', this.baseUrl).toString(),
        data,
        { headers: { apikey: this.apiKey } },
      ),
    );

    return {
      accessToken: resp.data.access_token,
      refreshToken: resp.data.refresh_token,
      expiresAt: Date.now() + resp.data.expires_in * 1000,
      refreshExpiresAt: Date.now() + resp.data.refresh_expires_in * 1000,
    };
  }

  private async ensureAuth(force = false) {
    if (!force && this.#token) {
      if (this.#token.expiresAt > Date.now()) {
      } else if (this.#token.refreshExpiresAt > Date.now()) {
        this.#token = await this.authorize(this.#token.refreshToken);
      }
    } else {
      this.#token = await this.authorize();
    }

    return `Bearer ${this.#token.accessToken}`;
  }

  async createEntity() {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CreateEntityResponse>(
        new URL('entities/1.2/entities', this.baseUrl).toString(),
        {
          entityType: 'naturalPerson',
        },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return resp.data.entityId;
  }

  async createWallet(entityId: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CreateWalletResponse>(
        new URL('wallets/1.0/wallets', this.baseUrl).toString(),
        {
          entityId,
          walletStatus: 'active',
        },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return resp.data.walletId;
  }

  async getAvailablePaymentMethods(request: GetPaymentMethodsRequest) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.get<GetPaymentMethodsResponse>(
        new URL('payment-methods/1.0/paymentmethodtypes', this.baseUrl).toString(),
        {
          params: request,
          headers: { 'X-User-Bearer': token, apikey: this.apiKey },
        },
      ),
    );

    return resp.data;
  }

  async createPaymentMethod(walletId: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CreatePaymentMethodResponse>(
        new URL(`wallets/1.0/wallets/${walletId}/paymentmethods`, this.baseUrl).toString(),
        {
          paymentMethodType: 'emoney-out',
          paymentMethodStatus: 'active',
        },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return resp.data.paymentMethodId;
  }

  async createCard(entityId: string, paymentMethodId: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CreatePaymentMethodResponse>(
        new URL('issuing/1.0/issuing/cards', this.baseUrl).toString(),
        {
          type: 'virtual',
          entity: entityId,
          paymentMethodReference: paymentMethodId,
          productId: 'test',
        },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return resp.data;
  }

  async getWithdrawMethods(country: string) {
    return this.getAvailablePaymentMethods({
      country,
      direction: 'out',
      paymentMethodTypeClass: 'cash',
      paymentMethodTypeStatus: 'available',
    });
  }

  async makeWithdraw({ paymentMethod, ...payload }: TransactionRequest) {
    const token = await this.ensureAuth();
    const { data } = await lastValueFrom(
      this.http.post<TransactionResponse>(
        `${this.baseUrl}/transactions/1.0/transactions/type/withdrawal`,
        // TODO: require payment method for SCOPA crypto wallet
        { ...payload, creditParty: paymentMethod, deditParty: { paymentMethodReference: 'wqewqq' } },
        { headers: { 'X-User-Bearer': token, 'X-Callback-URL': this.webhookUrl } },
      ),
    );

    return {
      id: data.transactionReference,
      status: data.transactionStatus,
      paymentCode: data.requiredAction.data.code,
    };
  }
}
