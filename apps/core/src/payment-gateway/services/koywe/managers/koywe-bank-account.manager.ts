import { BankAccountEntity } from '@/payment-gateway/entities/prime_trust/bank-account.entity';
import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { BankAccountParams, BanksInfoResponse } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { countriesData, CountryData } from '../../../country/data';
import { KoyweTokenManager } from './koywe-token.manager';

@Injectable()
export class KoyweBankAccountManager {
  private readonly koywe_url: string;
  constructor(
    private userService: UserService,
    private readonly koyweTokenManager: KoyweTokenManager,
    private readonly httpService: HttpService,

    @InjectRepository(BankAccountEntity)
    private readonly bankAccountEntityRepository: Repository<BankAccountEntity>,

    config: ConfigService<ConfigInterface>,
  ) {
    const { koywe_url } = config.get('app');
    this.koywe_url = koywe_url;
  }

  async getBanksInfo(country: string): Promise<BanksInfoResponse> {
    if (country === 'US') {
      return {
        data: [],
      };
    }
    const countries: CountryData = countriesData;
    const { code } = countries[country];

    const result = await lastValueFrom(this.httpService.get(`${this.koywe_url}/bank-info/${code}`));

    return {
      data: result.data,
    };
  }

  async addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    const { bank_code, bank_account_number, id, bank_account_name } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const {
      country: { code: country },
      email,
    } = userDetails;
    const countries: CountryData = countriesData;
    const { code, currency_type } = countries[country];

    const formData = {
      accountNumber: bank_account_number,
      countryCode: code,
      currencySymbol: currency_type,
      bankCode: bank_code,
    };
    const { token } = await this.koyweTokenManager.getToken(email);
    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const bankResponse = await lastValueFrom(
        this.httpService.post(`${this.koywe_url}/bank-accounts`, formData, { headers: headersRequest }),
      );

      const newAccount = await this.bankAccountEntityRepository.save(
        this.bankAccountEntityRepository.create({
          user_id: id,
          bank_code,
          country: userDetails.country.code,
          bank_account_name,
          bank_account_number,
          account_uuid: bankResponse.data._id,
          account: bankResponse.data.account,
        }),
      );

      return {
        id: newAccount.id,
        bank_account_name,
        bank_account_number,
      };
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
