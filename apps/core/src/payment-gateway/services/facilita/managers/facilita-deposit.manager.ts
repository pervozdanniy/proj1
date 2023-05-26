import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Fraction from 'fraction.js';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { BankCredentialsData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { UserEntity } from '../../../../user/entities/user.entity';
import { countriesData, CountryData } from '../../../country/data';
import { TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { CurrencyService } from '../../currency.service';
import { facilitaBank } from '../constants';
import { countBrazilRate } from '../facilita-helpers';
import { FacilitaTokenManager } from './facilita-token.manager';

@Injectable()
export class FacilitaDepositManager {
  private readonly logger = new Logger(FacilitaDepositManager.name);
  private readonly url: string;
  constructor(
    private readonly facilitaTokenManager: FacilitaTokenManager,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
    private userService: UserService,
    private readonly currencyService: CurrencyService,
    private readonly httpService: HttpService,

    config: ConfigService<ConfigInterface>,
  ) {
    const { facilita_url } = config.get('app', { infer: true });
    this.url = facilita_url;
  }

  async createWireReference({
    amount_usd,
    currency_type: currency,
    user_id,
  }: CreateReferenceRequest): Promise<BankCredentialsData> {
    const user = await this.userService.getUserInfo(user_id);
    await this.createUserIfNotExist(user);
    const countries: CountryData = countriesData;
    const { currency_type } = countries[user.country_code];
    const ratesData = await this.currencyService.waitForRatesUpdate();
    const rate = ratesData.get(currency_type);
    const amount = amount_usd * rate;
    let currentFee = 0;
    if (user.country_code === 'BR') {
      const { fee } = this.calculateFeeFromBrazil(rate, amount);
      currentFee = fee;
    }

    await this.depositEntityRepository.save(
      this.depositEntityRepository.create({
        user_id,
        type: TransferTypes.DEPOSIT,
        amount: amount + currentFee,
        amount_usd,
        provider: Providers.FACILITA,
        currency_type,
        status: TransferStatus.PENDING,
        fee: currentFee,
      }),
    );

    return { info: { currency, amount: amount + currentFee, fee: currentFee }, bank: facilitaBank };
  }

  async createUserIfNotExist(user: UserEntity) {
    const { token } = await this.facilitaTokenManager.getToken();
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    const document = user.documents?.find((d) => d.status === 'approved');
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
      await lastValueFrom(
        this.httpService.post(`${this.url}/api/v1/subject/people`, data, { headers: headersRequest }),
      );
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, 'Facilita create user error!', 400);
    }
  }

  calculateFeeFromBrazil(pureRate: number, amount: number) {
    const finalRate = countBrazilRate(pureRate);
    const finalRateFraction = new Fraction(finalRate);
    const pureRateFraction = new Fraction(pureRate);
    const amountFraction = new Fraction(amount);

    const difference = finalRateFraction.sub(pureRateFraction).div(pureRateFraction).mul(100);

    const fee = Number(amountFraction.mul(difference).div(100).toString());

    return {
      fee,
    };
  }
}
