import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { URL } from 'node:url';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import {
  CardResponse,
  CardsListResponse,
  CreateCardRequest,
  CreateEntityResponse,
  CreatePaymentMethodRequest,
  CreatePaymentMethodResponse,
  CreateWalletResponse,
  ExtendedCardResponse,
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
    data.append('grant_type', 'password');
    if (refreshToken) {
      data.append('refresh_token', refreshToken);
    } else {
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
    console.log('TOKEN', this.#token.accessToken);

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

  async createPaymentMethod(request: CreatePaymentMethodRequest) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CreatePaymentMethodResponse>(
        new URL(`wallets/1.0/wallets/${request.walletId}/paymentmethods`, this.baseUrl).toString(),
        {
          ...request,
          paymentMethodStatus: 'active',
        },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return resp.data.paymentMethodId;
  }

  async createCard(payload: CreateCardRequest) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CardResponse>(new URL('issuing/1.0/issuing/cards', this.baseUrl).toString(), payload, {
        headers: { 'X-User-Bearer': token, apikey: this.apiKey },
      }),
    );

    return resp.data;
  }

  async activateCard(cardReference: string) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${cardReference}/activateCard`, this.baseUrl).toString(),
        {},
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return true;
  }

  async getCards(entityId: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.get<CardsListResponse>(new URL('issuing/1.0/issuing/cards', this.baseUrl).toString(), {
        params: { entityId },
        headers: { 'X-User-Bearer': token, apikey: this.apiKey },
      }),
    );

    return resp.data;
  }

  async getCardDetails(cardReference: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.get<ExtendedCardResponse>(
        new URL(`issuing/1.0/issuing/cards/${cardReference}`, this.baseUrl).toString(),
        {
          headers: { 'X-User-Bearer': token, apikey: this.apiKey },
        },
      ),
    );

    return resp.data;
  }

  /** virtual only */
  async cardRegenerateCvv(cardReference: string) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${cardReference}/activateCard`, this.baseUrl).toString(),
        {},
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return true;
  }

  async cardSetPin(cardReference: string, pin: string) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${cardReference}/pin`, this.baseUrl).toString(),
        { pin },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    );

    return true;
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
