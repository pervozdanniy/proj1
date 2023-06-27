import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { URL } from 'node:url';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import {
  BlockCardRequest,
  CardResponse,
  CardsListResponse,
  CreateCardRequest,
  CreateEntityRequest,
  CreateEntityResponse,
  CreatePaymentMethodRequest,
  CreatePaymentMethodResponse,
  CreateWalletResponse,
  ExtendedCardResponse,
  GetPaymentMethodsRequest,
  GetPaymentMethodsResponse,
  GetWalletBalanceResponse,
  TokenResponse,
  TransactionRequest,
  TransactionResponse,
  UnblockCardRequest,
} from '../interfaces/api.interface';

type AuthToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
};

const TIME_DIFF_MS = 10 * 1000 * 1000;

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

  #handleHttpException = (error: any): never => {
    if (axios.isAxiosError(error) && error.response) {
      throw new HttpException(error.response.data.errorDescription, error.response.status, { cause: error });
    }

    throw new InternalServerErrorException(error.message, { cause: error });
  };

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
    ).catch(this.#handleHttpException);

    return {
      accessToken: resp.data.access_token,
      refreshToken: resp.data.refresh_token,
      expiresAt: Date.now() + resp.data.expires_in * 1000 - TIME_DIFF_MS,
      refreshExpiresAt: Date.now() + resp.data.refresh_expires_in * 1000 - TIME_DIFF_MS,
    };
  }

  private async ensureAuth(force = false) {
    if (!force && this.#token) {
      if (this.#token.expiresAt > Date.now()) {
      } else if (this.#token.refreshExpiresAt > Date.now()) {
        this.#token = await this.authorize(this.#token.refreshToken);
      } else {
        this.#token = await this.authorize();
      }
    } else {
      this.#token = await this.authorize();
    }

    return `Bearer ${this.#token.accessToken}`;
  }

  private encodeCardRef(cardReference: string) {
    return `${encodeURIComponent(`cardId@${cardReference}`)}`;
  }

  async createEntity(request: CreateEntityRequest) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CreateEntityResponse>(
        new URL('entities/1.2/entities', this.baseUrl).toString(),
        {
          name: {
            firstName: request.firstName,
            lastName: request.lastName,
          },
          contact: {
            phoneNumber: request.phone,
            email: request.email,
            postalAddress: {
              addressLine1: request.address,
              city: request.city,
              postalCode: request.postalCode,
              country: request.country,
            },
          },
          idDocuments: [
            {
              idType: request.documentType,
              idNumber: request.documentNumber,
              issuerCountry: request.documentCountry,
            },
          ],
          entityType: 'naturalPerson',
        },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    ).catch(this.#handleHttpException);

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
    ).catch(this.#handleHttpException);

    return resp.data.walletId;
  }

  async walletGetBalance(walletId: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.get<GetWalletBalanceResponse>(
        new URL(`wallets/1.0/wallets/${walletId}/balance`, this.baseUrl).toString(),
        {
          headers: { 'X-User-Bearer': token, apikey: this.apiKey },
        },
      ),
    ).catch(this.#handleHttpException);

    return resp.data;
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
    ).catch(this.#handleHttpException);

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
    ).catch(this.#handleHttpException);

    return resp.data.paymentMethodId;
  }

  async createCard(payload: CreateCardRequest) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.post<CardResponse>(new URL('issuing/1.0/issuing/cards', this.baseUrl).toString(), payload, {
        headers: { 'X-User-Bearer': token, apikey: this.apiKey },
      }),
    ).catch(this.#handleHttpException);

    return resp.data;
  }

  async activateCard(cardReference: string) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${this.encodeCardRef(cardReference)}/activateCard`, this.baseUrl).toString(),
        {},
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    ).catch(this.#handleHttpException);
  }

  async deactivateCard(cardReference: string) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(
          `issuing/1.0/issuing/cards/${this.encodeCardRef(cardReference)}/deactivateCard`,
          this.baseUrl,
        ).toString(),
        {},
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    ).catch(this.#handleHttpException);
  }

  async getCards(entityId: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.get<CardsListResponse>(new URL('issuing/1.0/issuing/cards', this.baseUrl).toString(), {
        params: { entityId },
        headers: { 'X-User-Bearer': token, apikey: this.apiKey },
      }),
    ).catch(this.#handleHttpException);

    return resp.data;
  }

  async getCardDetails(cardReference: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.get<ExtendedCardResponse>(
        new URL(`issuing/1.0/issuing/cards/${this.encodeCardRef(cardReference)}`, this.baseUrl).toString(),
        {
          headers: { 'X-User-Bearer': token, apikey: this.apiKey },
        },
      ),
    ).catch(this.#handleHttpException);

    return resp.data;
  }

  /** virtual only */
  async cardRegenerateCvv(cardReference: string) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${this.encodeCardRef(cardReference)}/activateCard`, this.baseUrl).toString(),
        {},
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    ).catch(this.#handleHttpException);
  }

  /** physical only */
  async cardSetPin(cardReference: string, pin: string) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${this.encodeCardRef(cardReference)}/pin`, this.baseUrl).toString(),
        { pin },
        { headers: { 'X-User-Bearer': token, apikey: this.apiKey } },
      ),
    ).catch(this.#handleHttpException);
  }

  async cardBlock(cardReference: string, payload: BlockCardRequest) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${this.encodeCardRef(cardReference)}/blockCard`, this.baseUrl).toString(),
        payload,
        {
          headers: { 'X-User-Bearer': token, apikey: this.apiKey },
        },
      ),
    ).catch(this.#handleHttpException);
  }

  async cardUnblock(cardReference: string, payload: UnblockCardRequest) {
    const token = await this.ensureAuth();
    await lastValueFrom(
      this.http.put(
        new URL(`issuing/1.0/issuing/cards/${this.encodeCardRef(cardReference)}/unblockCard`, this.baseUrl).toString(),
        payload,
        {
          headers: { 'X-User-Bearer': token, apikey: this.apiKey },
        },
      ),
    ).catch(this.#handleHttpException);
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
    ).catch(this.#handleHttpException);

    return {
      id: data.transactionReference,
      status: data.transactionStatus,
      paymentCode: data.requiredAction.data.code,
    };
  }
}
