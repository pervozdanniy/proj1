import { UserEntity } from '@/user/entities/user.entity';
import { UserService } from '@/user/services/user.service';
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
import { countriesData, CountryData } from '../../../country/data';
import { TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { FeeService } from '../../../modules/fee/fee.service';
import { facilitaBank } from '../constants';
import { FacilitaMainManager } from './facilita-main.manager';
import { FacilitaTokenManager } from './facilita-token.manager';

@Injectable()
export class FacilitaDepositManager {
  private readonly logger = new Logger(FacilitaDepositManager.name);
  private readonly url: string;
  constructor(
    private readonly facilitaTokenManager: FacilitaTokenManager,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly facilitaMainManager: FacilitaMainManager,
    private readonly feeService: FeeService,
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
    if (user.country_code === 'BR') {
      const { total, fee: internalFee } = await this.feeService.calculate(amount_usd, user.country_code);
      const { fee, amount } = await this.calculateFeeFromBrazil(total, internalFee);

      await this.depositEntityRepository.save(
        this.depositEntityRepository.create({
          user_id,
          type: TransferTypes.DEPOSIT,
          amount,
          amount_usd,
          provider: Providers.FACILITA,
          currency_type,
          status: TransferStatus.PENDING,
          fee,
          internal_fee_usd: internalFee.valueOf(),
        }),
      );

      return { info: { currency, amount, fee }, bank: facilitaBank };
    }
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

      throw new ConflictException('Facilita create user error!');
    }
  }

  async calculateFeeFromBrazil(amount_usd: Fraction, fee_usd: Fraction) {
    const { brlusdspot: pureRate, brlusd: finalRate } = await this.facilitaMainManager.countBrazilRate();
    const beforeTaxesAmount = amount_usd.mul(pureRate);

    const amount = amount_usd.add(fee_usd).mul(finalRate);
    const fee = amount.sub(beforeTaxesAmount).valueOf();

    return {
      amount: amount.valueOf(),
      fee,
    };
  }
}
