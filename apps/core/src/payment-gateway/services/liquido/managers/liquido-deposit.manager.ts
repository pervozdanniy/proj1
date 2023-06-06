import {
  PaymentTypes,
  TransfersEntity,
  TransferStatus,
  TransferTypes,
} from '@/payment-gateway/entities/transfers.entity';
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
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { DepositRedirectData } from '~common/grpc/interfaces/payment-gateway';
import { countriesData, liquidoFees } from '../../../country/data';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { FeeService } from '../../../modules/fee/fee.service';
import { VeriffDocumentEntity } from '../../../modules/veriff/entities/veriff-document.entity';
import { KoyweMainManager } from '../../koywe/managers/koywe-main.manager';
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
    private readonly koyweMainManager: KoyweMainManager,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
    private readonly userService: UserService,
    private readonly feeService: FeeService,
  ) {
    const { domain } = config.get('app', { infer: true });
    const { x_api_key, api_url } = config.get('liquido', { infer: true });
    this.x_api_key = x_api_key;
    this.api_url = api_url;
    this.domain = domain;
  }

  async createCashPayment({ user_id, amount_usd }: CreateReferenceRequest): Promise<DepositRedirectData> {
    const userDetails = await this.userService.getUserInfo(user_id);
    const document = userDetails.documents?.find((d) => d.status === 'approved');
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }

    const { currency_type } = countriesData[userDetails.country_code];
    const { total, fee: internalFee } = await this.feeService.calculate(amount_usd, userDetails.country_code);
    const { amount, fee } = this.calculateAmountAfterLiquidoFee(total, internalFee, userDetails.country_code);

    const quote = await this.koyweMainManager.getCurrencyAmountByUsd(amount.valueOf(), currency_type);
    const totalFee = fee.add(quote.networkFee).add(quote.koyweFee);

    const { orderId, url } = await this.createPaymentLink(quote.amountOut, currency_type, userDetails, document);

    await this.depositEntityRepository.save(
      this.depositEntityRepository.create({
        user_id,
        uuid: orderId,
        type: TransferTypes.DEPOSIT,
        amount: quote.amountOut,
        payment_type: PaymentTypes.CASH,
        amount_usd,
        provider: Providers.LIQUIDO,
        currency_type,
        fee: totalFee.valueOf(),
        status: TransferStatus.PENDING,
        internal_fee_usd: internalFee.valueOf(),
      }),
    );

    return {
      url,
      info: {
        amount: quote.amountOut,
        rate: quote.exchangeRate,
        fee: totalFee.valueOf(),
        currency: currency_type,
      },
    };
  }

  async createPaymentLink(
    amountOut: number,
    currency_type: string,
    userDetails: UserEntity,
    document: VeriffDocumentEntity,
  ): Promise<{ orderId: string; url: string }> {
    const { token } = await this.liquidoTokenManager.getToken();
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-api-key': this.x_api_key,
    };
    const orderId = await uid(18);
    const formData = {
      orderId: orderId,
      amount: amountOut,
      currency: currency_type,
      country: userDetails.country_code,
      allowPaymentMethods: ['PAY_CASH'],
      name: userDetails.details.first_name,
      email: userDetails.email,
      phone: userDetails.phone,
      documentId: document.person_id_number,
      callbackUrl: `${this.domain}/webhook/liquido`,
      description: 'this is a test payment',
    };

    try {
      const result = await lastValueFrom(
        this.httpService.post(`${this.api_url}/v2/cashier/payment-link/`, formData, { headers: headersRequest }),
      );

      return {
        orderId,
        url: result.data.paymentLink,
      };
    } catch (e) {
      this.logger.error(e.response.data);

      throw new ConflictException('Payment link creation error!');
    }
  }

  calculateAmountAfterLiquidoFee(amount_usd: Fraction, fee_usd: Fraction, country_code: string) {
    const { feeUsd, feePercents } = liquidoFees[country_code];
    const fee = amount_usd.mul(new Fraction(feePercents, 100)).add(feeUsd);

    return { amount: amount_usd.add(fee).add(fee_usd), fee: fee.add(fee_usd) };
  }
}
