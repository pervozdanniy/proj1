import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { async, lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import {
  CreateEntityResponse,
  CreatePaymentMethodResponse,
  CreateWalletResponse,
  GetAvailablePaymentMethodsResponse,
  TokenResponse,
} from './api.interface';

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
};

type EntityResponse = {
  entityId: string;
  [key: string]: any;
};

type WalletResponse = {
  walletId: string;
  [key: string]: any;
};

type ImageUrl = string;

type PaymentMethodsResponse = Array<{
  currency: string;
  fields: Array<{
    name: string;
    description: string;
    regex: string;
    mandatory: boolean;
    isUserField: boolean;
    fieldType: 'input' | 'select';
    validOptions: string[];
  }>;
  imageURL: ImageUrl | null;
  paymentMethodType: string;
  paymentMethodTypeClass: string;
  paymentMethodTypeDescription: string;
  usage: ImageUrl;
}>;

type TransactionRequest = {
  country: string;
  amount: number;
  currency: string;
  paymentMethod: {
    type: string;
    data: Record<string, string>;
  };
};

type TransactionResponse = {
  type: 'withdrawal' | string;
  amount: number;
  currency: string;
  transactionStatus:
    | 'initial'
    | 'finished'
    | 'error'
    | 'conciliate'
    | 'reverted'
    | 'reserved'
    | 'cancelled'
    | 'secondStepInitial'
    | 'pending'
    | 'pendingExpired'
    | 'ongoingExpired'
    | 'pendingRejected'
    | 'conciliateReversal'
    | 'waiting'
    | 'reverting'
    | 'processingPayment';
  transactionReference: string;
  requiredAction: {
    actionType: 'paymentcode' | string;
    data: {
      additionalInformation: Array<{
        key: string;
        value: string;
      }>;
      code: string;
    };
    expirationDate: string;
    relatedPaymentMethodData: {
      paymentMethodType: string;
      paymentMethodTypeClass: string;
      paymentMethodTypeCountry: string;
      paymentMethodTypeDescription: string;
    };
    status: 'active' | 'confirmed' | 'cancelled' | 'expired';
  };
  [key: string]: any;
};

type AuthToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
};

@Injectable()
export class InswitchApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly authData: { username: string; password: string };

  #token?: AuthToken;

  private readonly webhookUrl;
  // private token?: Token;
  // private readonly baseUrl = 'https://gateway-am.apps.ins.inswhub.com';
  // private readonly apiKey =
  //   'eyJ4NXQiOiJNV1ExTWpBMlpESm1PV1U1WXpjNFpUazFZelk1T1dVeU56SmtaV1l5TWpZNE5qa3pZVFkyWXpjNE9EY3lZMlprWmpGaVpHUmhNMkkyTUdFeU5qRmpaZyIsImtpZCI6Im9rZGF3cyIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0=.eyJzdWIiOiJza29wYWRldkBjYXJib24uc3VwZXIiLCJhcHBsaWNhdGlvbiI6eyJvd25lciI6InNrb3BhZGV2IiwidGllclF1b3RhVHlwZSI6bnVsbCwidGllciI6IlVubGltaXRlZCIsIm5hbWUiOiJEZWZhdWx0QXBwbGljYXRpb24iLCJpZCI6MjQ4LCJ1dWlkIjoiM2FkOGMxODctY2E2Ny00MTkwLThjYWItYjNlYTVmMTI5NGRjIn0sImlzcyI6Imh0dHBzOlwvXC9hcGltLW1hbmFnZW1lbnQuYXBwcy5pbnMuaW5zd2h1Yi5jb206NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiQnJvbnplIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJncmFwaFFMTWF4Q29tcGxleGl0eSI6MCwiZ3JhcGhRTE1heERlcHRoIjowLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOm51bGx9LCJVbmxpbWl0ZWQiOnsidGllclF1b3RhVHlwZSI6InJlcXVlc3RDb3VudCIsImdyYXBoUUxNYXhDb21wbGV4aXR5IjowLCJncmFwaFFMTWF4RGVwdGgiOjAsInN0b3BPblF1b3RhUmVhY2giOnRydWUsInNwaWtlQXJyZXN0TGltaXQiOjAsInNwaWtlQXJyZXN0VW5pdCI6bnVsbH19LCJrZXl0eXBlIjoiU0FOREJPWCIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkF1dGgtU2VydmljZSIsImNvbnRleHQiOiJcL2F1dGgtc2VydmljZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW4iLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IkJyb256ZSJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJQYXltZW50LU1ldGhvZHMiLCJjb250ZXh0IjoiXC9wYXltZW50LW1ldGhvZHNcLzEuMCIsInB1Ymxpc2hlciI6InBvcnRhbCIsInZlcnNpb24iOiIxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiQnJvbnplIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkVudGl0aWVzIiwiY29udGV4dCI6IlwvZW50aXRpZXNcLzEuMiIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6IjEuMiIsInN1YnNjcmlwdGlvblRpZXIiOiJCcm9uemUifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRlgiLCJjb250ZXh0IjoiXC9meFwvMS4wIiwicHVibGlzaGVyIjoicHVibGlzaGVyLnVzZXIiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJIb3N0ZWRDaGVja291dCIsImNvbnRleHQiOiJcL2hvc3RlZGNoZWNrb3V0XC8xLjAiLCJwdWJsaXNoZXIiOiJhZG1pbiIsInZlcnNpb24iOiIxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiVW5saW1pdGVkIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6Ik5vdGlmaWNhdGlvbkVuZ2luZSIsImNvbnRleHQiOiJcL25vdGlmaWNhdGlvbmVuZ2luZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW4iLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IkJyb256ZSJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJUcmFuc2FjdGlvbnMiLCJjb250ZXh0IjoiXC90cmFuc2FjdGlvbnNcLzEuMCIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6IjEuMCIsInN1YnNjcmlwdGlvblRpZXIiOiJCcm9uemUifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiV2FsbGV0cyIsImNvbnRleHQiOiJcL3dhbGxldHNcLzEuMCIsInB1Ymxpc2hlciI6InB1Ymxpc2hlci51c2VyIiwidmVyc2lvbiI6IjEuMCIsInN1YnNjcmlwdGlvblRpZXIiOiJCcm9uemUifV0sImlhdCI6MTY4MDEwNjc3OCwianRpIjoiMzBlZmZlNWYtZmQxMS00NTRjLTg2ZmQtYzRlNDFmYWJjN2RiIn0=.vb_UsjOt-kJZ6M34npy_UG9ZpxmdxtuJcuAKBbBRVeV0d3EzAjgFPhfZOrgmBaXd5yjUuXIA-nsCiFsIPjq-PyQdkIYf9xlTRzXHu7-1_KgP_nNYGv4qNS9UWUEUSqkvfxSuoc9h-PJ3YgI32oEgFuoG1vIct0N2VfSX9kvnCSMsRXJxIgiIiu77hEgRxoTpp7K3RXg48n69dz_XzZryA-XSiUz8abLsdDqiokYKGdPF625oEY9nqH3IeJf4YEAM_9ZjT-PvPIwF005qItrEz9vH7sA03F__lsB47I3r2Zy7v56Iul2c1zGEiw306AD06XKcNfoDd-EsUB6bgrGFRw==';

  constructor(private readonly http: HttpService, config: ConfigService<ConfigInterface>) {
    this.webhookUrl = new URL('webhook/inswitch', config.get('app.domain', { infer: true })).toString();
    const { url, apiKey, username, password } = config.get('inswitch', { infer: true });
    this.apiKey = apiKey;
    this.baseUrl = url;
    this.authData = { username, password };
  }

  private async auth(refreshToken?: string): Promise<AuthToken> {
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
        this.#token = await this.auth(this.#token.refreshToken);
      }
    } else {
      this.#token = await this.auth();
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

  async getAvailablePaymentMethods(countryCode: string) {
    const token = await this.ensureAuth();
    const resp = await lastValueFrom(
      this.http.get<GetAvailablePaymentMethodsResponse>(
        new URL('payment-methods/1.0/paymentmethodtypes', this.baseUrl).toString(),
        {
          params: {
            direction: 'out',
            country: countryCode,
            paymentMethodTypeClass: 'emoney',
            paymentMethodTypeStatus: 'active',
          },
          headers: { 'X-User-Bearer': token, apikey: this.apiKey },
        },
      ),
    );
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
  }

  async getWithdrawMethods(country: string) {
    const token = await this.ensureAuth();
    const { data } = await lastValueFrom(
      this.http.get<PaymentMethodsResponse>(`${this.baseUrl}/payment-methods/1.0/paymentmethodtypes`, {
        params: {
          country,
          direction: 'out',
          paymentMethodTypeClass: 'cash',
          paymentMethodTypeStatus: 'available',
        },
        headers: { 'X-User-Bearer': `Bearer ${token}` },
      }),
    );

    return data;
  }

  async makeWithdraw({ paymentMethod, ...payload }: TransactionRequest) {
    const token = await this.ensureAuth();
    const { data } = await lastValueFrom(
      this.http.post<TransactionResponse>(
        `${this.baseUrl}/transactions/1.0/transactions/type/withdrawal`,
        { ...payload, creditParty: paymentMethod, deditParty: { paymentMethodReference: 'wqewqq' } },
        { headers: { 'X-User-Bearer': `Bearer ${token}`, 'X-Callback-URL': this.webhookUrl } },
      ),
    );

    return {
      id: data.transactionReference,
      status: data.transactionStatus,
      paymentCode: data.requiredAction.data.code,
    };
  }
}
