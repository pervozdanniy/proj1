import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { BankCredentialsData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { UserEntity } from '../../../../user/entities/user.entity';
import { countriesData, CountryData } from '../../../country/data';
import { TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { CurrencyService } from '../../currency.service';
import { facilitaBank, facilitaTaxes } from '../constants';
import { FacilitaTokenManager } from './facilita-token.manager';

@Injectable()
export class FacilitaDepositManager {
  private readonly logger = new Logger(FacilitaDepositManager.name);
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
    amount: amountUSD,
    currency_type: currency,
    id: user_id,
  }: CreateReferenceRequest): Promise<BankCredentialsData> {
    const user = await this.userService.getUserInfo(user_id);
    await this.createUserIfNotExist(user);
    const countries: CountryData = countriesData;
    const { currency_type } = countries[user.country_code];
    const ratesData = await this.currencyService.rate;
    const rate = ratesData.get(currency_type);
    const amount = amountUSD * rate;
    console.log(this.calculateExpressionAndDifference(rate));

    await this.depositEntityRepository.save(
      this.depositEntityRepository.create({
        user_id,
        type: TransferTypes.DEPOSIT,
        amount,
        amount_usd: amountUSD,
        provider: Providers.FACILITA,
        currency_type,
        status: TransferStatus.PENDING,
        fee: 0,
      }),
    );

    return { info: { currency, amount, fee: 0 }, bank: facilitaBank };
  }

  async createUserIfNotExist(user: UserEntity): Promise<{ subject_id: string }> {
    const { token } = await this.facilitaTokenManager.getToken();
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    const document = await this.documentRepository.findOneBy({ user_id: user.id, status: 'approved' });
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
      this.logger.error(e.response.data.errors);

      throw new GrpcException(Status.ABORTED, 'Facilita create user error!', 400);
    }
  }

  calculateExpressionAndDifference(rate: number) {
    const { facilita_fee: percent1, crypto_settlement: percent2, brazil_federal_tax: percent3 } = facilitaTaxes;
    const result =
      rate +
      (percent1 / 100) * rate +
      (percent2 / 100) * (rate + (percent1 / 100) * rate) +
      (percent3 / 100) * (rate + (percent1 / 100) * rate + (percent2 / 100) * (rate + (percent1 / 100) * rate));
    const difference = ((result - rate) / rate) * 100;

    return {
      result,
      difference,
    };
  }
}
