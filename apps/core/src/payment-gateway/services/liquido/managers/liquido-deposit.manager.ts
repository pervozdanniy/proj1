import { TransfersEntity, TransferStatus, TransferTypes } from '@/payment-gateway/entities/transfers.entity';
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
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
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

    private userService: UserService,
  ) {
    const { domain } = config.get('app', { infer: true });
    const { x_api_key, api_url } = config.get('liquido', { infer: true });
    this.x_api_key = x_api_key;
    this.api_url = api_url;
    this.domain = domain;
  }

  async createCashPayment({ user_id, amount_usd }: CreateReferenceRequest): Promise<DepositRedirectData> {
    const { token } = await this.liquidoTokenManager.getToken();
    const userDetails = await this.userService.getUserInfo(user_id);
    const { currency_type } = countriesData[userDetails.country_code];
    const { amountOut, networkFee, koyweFee } = await this.koyweMainManager.getCurrencyAmountByUsd(
      amount_usd,
      currency_type,
    );
    const totalFee = networkFee + koyweFee;

    const document = userDetails.documents?.find((d) => d.status === 'approved');
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }

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
          user_id,
          uuid: orderId,
          type: TransferTypes.DEPOSIT,
          amount: amountOut,
          amount_usd,
          provider: Providers.LIQUIDO,
          currency_type,
          fee: totalFee,
          status: TransferStatus.PENDING,
        }),
      );

      return {
        url: result.data.paymentLink,
        info: {
          amount: amountOut,
          rate: amountOut / amount_usd,
          fee: totalFee,
          currency: currency_type,
        },
      };
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
