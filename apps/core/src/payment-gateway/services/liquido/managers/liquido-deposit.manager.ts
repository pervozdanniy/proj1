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
import { CreateReferenceRequest, DepositRedirectData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { countriesData } from '../../../country/data';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
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

  async createCashPayment({ id, amount: beforeConvertAmount }: CreateReferenceRequest): Promise<DepositRedirectData> {
    const { token } = await this.liquidoTokenManager.getToken();
    const userDetails = await this.userService.getUserInfo(id);
    const { currency_type } = countriesData[userDetails.country_code];

    const convertData = await lastValueFrom(
      this.httpService.get(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${currency_type}`),
    );

    const convertedAmount = parseFloat(beforeConvertAmount) * parseFloat(convertData.data[currency_type]);

    const document = await this.documentRepository.findOneBy({ user_id: id, status: 'approved' });
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }

    const amount = parseFloat(convertedAmount.toFixed(2));

    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-api-key': this.x_api_key,
    };
    const formData = {
      orderId: await uid(18),
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

      return {
        url: result.data.paymentLink,
        info: { amount: String(amount), rate: convertData.data[currency_type], fee: '0', currency: currency_type },
      };
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
