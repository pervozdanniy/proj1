import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { BankCredentialsData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { countriesData, CountryData } from '../../../country/data';
import { TransfersEntity } from '../../../entities/transfers.entity';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { CurrencyService } from '../../currency.service';
import { FacilitaTokenManager } from './facilita-token.manager';

@Injectable()
export class FacilitaDepositManager {
  private readonly url: string;
  constructor(
    private readonly facilitaTokenManager: FacilitaTokenManager,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
    @InjectRepository(VeriffDocumentEntity)
    private readonly documentRepository: Repository<VeriffDocumentEntity>,
    private userService: UserService,

    private readonly currencyService: CurrencyService,
    private readonly httpService: HttpService,

    config: ConfigService<ConfigInterface>,
  ) {
    const { facilita_url } = config.get('app', { infer: true });
    this.url = facilita_url;
  }

  async createWireReference({
    amount,
    currency_type: currency,
    id,
  }: CreateReferenceRequest): Promise<BankCredentialsData> {
    const user = await this.userService.getUserInfo(id);

    const countries: CountryData = countriesData;
    const { currency_type } = countries[user.country_code];
    // const faciltaBanks = await lastValueFrom(
    //   this.httpService.get(`${this.url}/api/v1/bank_accounts/`, { headers: headersRequest }),
    // );
    // const bankData = faciltaBanks.data.data.filter((b: FacilitaBankAccount) => {
    //   return b.currency === currency_type;
    // });
    const convertedRate = await this.currencyService.convert(amount, [currency_type]);
    const convertedAmount = Number.parseFloat(convertedRate[currency_type].amount.toFixed(2));
    const { subject_id } = await this.createUserIfNotExist(id);
    const bankData = await this.sendTransaction(convertedAmount, currency_type, subject_id);
    const payload = {
      user_id: id,
      uuid: bankData.bank_transaction.id,
      type: 'deposit',
      amount,
      provider: Providers.FACILITA,
      currency_type: currency,
      status: 'waiting',
      fee: 0,
    };

    await this.depositEntityRepository.save(this.depositEntityRepository.create(payload));

    return { info: { currency, amount, fee: 0 }, bank: JSON.stringify(bankData.from_bank_account) };
  }

  async createUserIfNotExist(id: number): Promise<{ subject_id: string }> {
    const { token } = await this.facilitaTokenManager.getToken();
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    const user = await this.userService.getUserInfo(id);
    const document = await this.documentRepository.findOneBy({ user_id: id, status: 'approved' });
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }
    const data = {
      person: {
        document_number: document.document_number,
        fiscal_country: user.country_code,
        social_name: `${user.details.first_name} ${user.details.last_name}`,
        email: user.email,
      },
    };
    try {
      const facilitaUser = await lastValueFrom(
        this.httpService.post(`${this.url}/api/v1/subject/people`, data, { headers: headersRequest }),
      );

      return { subject_id: facilitaUser.data.data.id };
    } catch (e) {
      throw new GrpcException(Status.ABORTED, 'Facilita create user error!', 400);
    }
  }

  async sendTransaction(amount: number, currency: string, subject_id: string) {
    const { token } = await this.facilitaTokenManager.getToken();
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    const data = {
      transaction: {
        currency: currency,
        exchange_currency: currency,
        value: amount,
        from_bank_account_id: 'a404efa0-8e0e-4143-bf49-9de5aab4f64e',
        to_bank_account_id: '85f94bbc-c131-480f-aa71-f2ccf9f34bd8',
        subject_id,
      },
    };

    try {
      const transactionResponse = await lastValueFrom(
        this.httpService.post(`${this.url}/api/v1/transactions`, data, { headers: headersRequest }),
      );

      return transactionResponse.data.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, 'Facilita transaction error!', 400);
    }
  }
}
