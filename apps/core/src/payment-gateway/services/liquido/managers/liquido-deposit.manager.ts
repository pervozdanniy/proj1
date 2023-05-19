import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { DepositRedirectData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { countriesData } from '../../../country/data';
import { TransfersEntity } from '../../../entities/transfers.entity';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { CurrencyService } from '../../currency.service';
import { LiquidoTokenManager } from './liquido-token.manager';

@Injectable()
export class LiquidoDepositManager {
  private readonly logger = new Logger(LiquidoDepositManager.name);
  private readonly api_url: string;
  private readonly domain: string;
  private readonly x_api_key: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly liquidoTokenManager: LiquidoTokenManager,
    private readonly httpService: HttpService,

    private readonly currencyService: CurrencyService,

    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,

    @InjectRepository(VeriffDocumentEntity)
    private readonly documentRepository: Repository<VeriffDocumentEntity>,

    private userService: UserService,
  ) {
    const { domain } = config.get('app', { infer: true });
    const { x_api_key, api_url } = config.get('liquido', { infer: true });
    this.x_api_key = x_api_key;
    this.api_url = api_url;
    this.domain = domain;
  }

  async createCashPayment({
    id,
    amount: beforeConvertAmount,
    currency_type: currency,
  }: CreateReferenceRequest): Promise<DepositRedirectData> {
    const { token } = await this.liquidoTokenManager.getToken();
    const userDetails = await this.userService.getUserInfo(id);
    const { currency_type } = countriesData[userDetails.country_code];

    const convertedAmount = await this.currencyService.convert(parseFloat(beforeConvertAmount), [currency_type]);

    const document = await this.documentRepository.findOneBy({ user_id: id, status: 'approved' });
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }

    const amount = parseFloat(convertedAmount[currency_type].amount);

    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-api-key': this.x_api_key,
    };
    const orderId = await uid(18);
    const formData = {
      orderId: orderId,
      amount: amount,
      currency: currency_type,
      country: userDetails.country_code,
      allowPaymentMethods: ['PAY_CASH'],
      name: userDetails.details.first_name,
      email: userDetails.email,
      phone: userDetails.phone,
      documentId: document.document_number,
      callbackUrl: `${this.domain}/webhook/liquido`,
      description: 'this is a test payment',
    };

    try {
      const result = await lastValueFrom(
        this.httpService.post(`${this.api_url}/v2/cashier/payment-link/`, formData, { headers: headersRequest }),
      );

      await this.depositEntityRepository.save(
        this.depositEntityRepository.create({
          user_id: id,
          uuid: orderId,
          type: 'deposit',
          amount: beforeConvertAmount,
          provider: Providers.LIQUIDO,
          currency_type: currency,
          status: 'waiting',
        }),
      );

      return {
        url: result.data.paymentLink,
        info: {
          amount: String(amount),
          rate: String(convertedAmount[currency_type].rate),
          fee: '0',
          currency: currency_type,
        },
      };
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
