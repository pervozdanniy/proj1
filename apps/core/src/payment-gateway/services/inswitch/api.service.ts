import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';

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

type Token = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  refresh_expires_at: number;
};

@Injectable()
export class InswitchApiService {
  private readonly webhookUrl;
  private token?: Token;
  private readonly baseUrl = 'https://gateway-am.apps.ins.inswhub.com';
  private readonly apiKey =
    'eyJ4NXQiOiJNV1ExTWpBMlpESm1PV1U1WXpjNFpUazFZelk1T1dVeU56SmtaV1l5TWpZNE5qa3pZVFkyWXpjNE9EY3lZMlprWmpGaVpHUmhNMkkyTUdFeU5qRmpaZyIsImtpZCI6Im9rZGF3cyIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0=.eyJzdWIiOiJza29wYWRldkBjYXJib24uc3VwZXIiLCJhcHBsaWNhdGlvbiI6eyJvd25lciI6InNrb3BhZGV2IiwidGllclF1b3RhVHlwZSI6bnVsbCwidGllciI6IlVubGltaXRlZCIsIm5hbWUiOiJEZWZhdWx0QXBwbGljYXRpb24iLCJpZCI6MjQ4LCJ1dWlkIjoiM2FkOGMxODctY2E2Ny00MTkwLThjYWItYjNlYTVmMTI5NGRjIn0sImlzcyI6Imh0dHBzOlwvXC9hcGltLW1hbmFnZW1lbnQuYXBwcy5pbnMuaW5zd2h1Yi5jb206NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiQnJvbnplIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJncmFwaFFMTWF4Q29tcGxleGl0eSI6MCwiZ3JhcGhRTE1heERlcHRoIjowLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOm51bGx9LCJVbmxpbWl0ZWQiOnsidGllclF1b3RhVHlwZSI6InJlcXVlc3RDb3VudCIsImdyYXBoUUxNYXhDb21wbGV4aXR5IjowLCJncmFwaFFMTWF4RGVwdGgiOjAsInN0b3BPblF1b3RhUmVhY2giOnRydWUsInNwaWtlQXJyZXN0TGltaXQiOjAsInNwaWtlQXJyZXN0VW5pdCI6bnVsbH19LCJrZXl0eXBlIjoiU0FOREJPWCIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkF1dGgtU2VydmljZSIsImNvbnRleHQiOiJcL2F1dGgtc2VydmljZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW4iLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IkJyb256ZSJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJQYXltZW50LU1ldGhvZHMiLCJjb250ZXh0IjoiXC9wYXltZW50LW1ldGhvZHNcLzEuMCIsInB1Ymxpc2hlciI6InBvcnRhbCIsInZlcnNpb24iOiIxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiQnJvbnplIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkVudGl0aWVzIiwiY29udGV4dCI6IlwvZW50aXRpZXNcLzEuMiIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6IjEuMiIsInN1YnNjcmlwdGlvblRpZXIiOiJCcm9uemUifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRlgiLCJjb250ZXh0IjoiXC9meFwvMS4wIiwicHVibGlzaGVyIjoicHVibGlzaGVyLnVzZXIiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJIb3N0ZWRDaGVja291dCIsImNvbnRleHQiOiJcL2hvc3RlZGNoZWNrb3V0XC8xLjAiLCJwdWJsaXNoZXIiOiJhZG1pbiIsInZlcnNpb24iOiIxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiVW5saW1pdGVkIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6Ik5vdGlmaWNhdGlvbkVuZ2luZSIsImNvbnRleHQiOiJcL25vdGlmaWNhdGlvbmVuZ2luZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW4iLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IkJyb256ZSJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJUcmFuc2FjdGlvbnMiLCJjb250ZXh0IjoiXC90cmFuc2FjdGlvbnNcLzEuMCIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6IjEuMCIsInN1YnNjcmlwdGlvblRpZXIiOiJCcm9uemUifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiV2FsbGV0cyIsImNvbnRleHQiOiJcL3dhbGxldHNcLzEuMCIsInB1Ymxpc2hlciI6InB1Ymxpc2hlci51c2VyIiwidmVyc2lvbiI6IjEuMCIsInN1YnNjcmlwdGlvblRpZXIiOiJCcm9uemUifV0sImlhdCI6MTY4MDEwNjc3OCwianRpIjoiMzBlZmZlNWYtZmQxMS00NTRjLTg2ZmQtYzRlNDFmYWJjN2RiIn0=.vb_UsjOt-kJZ6M34npy_UG9ZpxmdxtuJcuAKBbBRVeV0d3EzAjgFPhfZOrgmBaXd5yjUuXIA-nsCiFsIPjq-PyQdkIYf9xlTRzXHu7-1_KgP_nNYGv4qNS9UWUEUSqkvfxSuoc9h-PJ3YgI32oEgFuoG1vIct0N2VfSX9kvnCSMsRXJxIgiIiu77hEgRxoTpp7K3RXg48n69dz_XzZryA-XSiUz8abLsdDqiokYKGdPF625oEY9nqH3IeJf4YEAM_9ZjT-PvPIwF005qItrEz9vH7sA03F__lsB47I3r2Zy7v56Iul2c1zGEiw306AD06XKcNfoDd-EsUB6bgrGFRw==';

  constructor(private readonly http: HttpService, config: ConfigService<ConfigInterface>) {
    this.webhookUrl = new URL('webhook/inswitch', config.get('app.domain', { infer: true })).toString();
  }

  async authorize(refreshToken?: string) {
    const form = new FormData();
    form.append('grant_type', 'password');
    if (refreshToken) {
      form.append('refresh_token', refreshToken);
    } else {
      form.append('username', 'skopadev');
      form.append('password', 'DU55cPCn3ZvS');
    }

    const resp = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/auth-service/1.0/protocol/openid-connect/token`, form, {
        headers: {
          apikey: this.apiKey,
        },
      }),
    );
    this.token = {
      access_token: resp.data.access_token,
      refresh_token: resp.data.refresh_token,
      expires_at: Date.now() + resp.data.expires_in,
      refresh_expires_at: Date.now() + resp.data.refresh_expires_in,
    };

    return resp.data.access_token;
  }

  async ensureAuth(): Promise<string> {
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }
    if (this.token.refresh_expires_at > Date.now()) {
      return this.authorize();
    }

    return this.authorize(this.token.refresh_token);
  }

  async createEntity() {
    const token = await this.ensureAuth();
    const { data } = await lastValueFrom(
      this.http.post<EntityResponse>(
        `${this.baseUrl}/entities/1.2/entities`,
        { entityType: 'naturalPerson' },
        { headers: { 'X-User-Bearer': `Bearer ${token}` } },
      ),
    );

    return data.entityId;
  }

  async createWallet(entityId: string) {
    const token = await this.ensureAuth();
    const { data } = await lastValueFrom(
      this.http.post<WalletResponse>(
        `${this.baseUrl}/wallets/1.0/wallets`,
        { entityId, walletStatus: 'active' },
        { headers: { 'X-User-Bearer': `Bearer ${token}` } },
      ),
    );

    return data.walletId;
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
