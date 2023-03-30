import { UserService } from '@/user/services/user.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { CreateReferenceRequest, JsonData } from '~common/grpc/interfaces/payment-gateway';
import { UserEntity } from '../../../../user/entities/user.entity';
import { countriesData, CountryData } from '../../../country/data';

@Injectable()
export class PayfuraDepositManager {
  private readonly payfura_url: string;
  private readonly payfura_key: string;
  private readonly payfura_secret: string;
  constructor(
    private readonly httpService: HttpService,

    private userService: UserService,
    config: ConfigService<ConfigInterface>,
  ) {
    const { payfura_url } = config.get('app');
    const { key, secret } = config.get('payfura');
    this.payfura_key = key;
    this.payfura_secret = secret;
    this.payfura_url = payfura_url;
  }

  async createReference(
    depositParams: CreateReferenceRequest,
    wallet_address: string,
    asset_transfer_method_id: string,
  ): Promise<JsonData> {
    const { amount: beforeConvertAmount, id } = depositParams;
    const userDetails = await this.userService.getUserInfo(id);
    const { currency_type } = countriesData[userDetails.country_code];

    const convertData = await lastValueFrom(
      this.httpService.get(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${currency_type}`),
    );

    const convertedAmount = parseFloat(beforeConvertAmount) * parseFloat(convertData.data[currency_type]);

    const amount = String(convertedAmount.toFixed(2));

    const data: {
      amount: string;
      currency_type: string;
      asset_transfer_method_id?: string;
      wallet_address?: string;
      url?: string;
    } = {
      amount,
      currency_type,
    };

    data.asset_transfer_method_id = asset_transfer_method_id;
    data.wallet_address = wallet_address;

    const user_id = await this.createUser(userDetails);
    const { url } = await this.createOrder(amount, wallet_address, user_id, userDetails.country_code);

    data.url = url;

    return { data: JSON.stringify([data]) };
  }

  async createUser(userDetails: UserEntity): Promise<string> {
    const phone = userDetails.phone;
    const countries: CountryData = countriesData;
    const { dial_code } = countries[userDetails.country_code];
    phone.replace(dial_code, '');

    const formData = {
      firstName: userDetails.details.first_name,
      lastName: userDetails.details.last_name,
      email: userDetails.email,
      dateOfBirth: userDetails.details.date_of_birth,
      isdCode: dial_code,
      phoneNumber: phone,
      addressInfo: {
        addressLine1: userDetails.details.street,
        state: userDetails.details.region,
        city: userDetails.details.city,
        country: userDetails.country_code,
        postalCode: userDetails.details.postal_code.toString(),
      },
    };
    const headersRequest = {
      Authorization: `Bearer ${this.payfura_secret}`,
    };
    let payfuraUserId;

    try {
      const userResponse = await lastValueFrom(
        this.httpService.post(`${this.payfura_url}/v1/partner/user`, formData, { headers: headersRequest }),
      );

      payfuraUserId = userResponse.data.response.user.id;
    } catch (e) {
      if (e.response.status === 409) {
        payfuraUserId = e.response.data.response.user.id;
      }
    }

    return payfuraUserId;
  }

  async createOrder(
    amount: string,
    wallet_address: string,
    userId: string,
    country_code: string,
  ): Promise<{ url: string }> {
    const fiatId = this.getFiatCurrencies(country_code);
    console.log(fiatId);
    const formData = {
      order: {
        cfpmId: fiatId,
        cryptoCurrencyId: 1,
        fiatAmount: amount,
        walletAddress: wallet_address,
      },
      userId: userId,
    };

    const headersRequest = {
      Authorization: `Bearer ${this.payfura_secret}`,
    };

    try {
      const orderResponse = await lastValueFrom(
        this.httpService.post(`${this.payfura_url}/v1/partner/order`, formData, { headers: headersRequest }),
      );

      const url = `https://sandbox.payfura.com/exchange?orderId=${orderResponse.data.orderId}&apiKey=${this.payfura_key}`;

      return { url };
    } catch (e) {
      console.log(e.response.data);
    }
  }

  async getFiatCurrencies(code: string) {
    let fiatId: number;
    try {
      const fiatResponse = await lastValueFrom(this.httpService.get(`${this.payfura_url}/v2/partner/fiat_currencies`));
      console.log(fiatResponse.data.response);
      fiatResponse.data.response.forEach(
        (fiat: { country_code: string; payment_methods: [{ cfpm_id: number; type: string }] }) => {
          if (fiat.country_code === code) {
            fiat.payment_methods.forEach((p) => {
              if (p.type === 'Voucher') {
                fiatId = p.cfpm_id;
              }
            });
          }
        },
      );
    } catch (e) {
      console.log(e.response.data);
    }

    return fiatId;
  }
}
