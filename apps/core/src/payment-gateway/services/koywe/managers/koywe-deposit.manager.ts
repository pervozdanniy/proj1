import { KoyweCreateOrder, KoyweQuote, ReferenceData } from '@/payment-gateway/types/koywe';
import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { CreateReferenceRequest, JsonData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { countriesData } from '../../../country/data';
import { KoyweMainManager, KoywePaymentMethod } from './koywe-main.manager';
import { KoyweTokenManager } from './koywe-token.manager';

export type KoyweReferenceParams = {
  wallet_address: string;
  asset_transfer_method_id: string;
  method?: KoywePaymentMethod;
};

@Injectable()
export class KoyweDepositManager {
  private readonly koywe_url: string;
  private readonly asset: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly koyweTokenManager: KoyweTokenManager,
    private readonly koyweMainManager: KoyweMainManager,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,

    private userService: UserService,
    config: ConfigService<ConfigInterface>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const { koywe_url } = config.get('app');
    const { short } = config.get('asset');
    this.asset = short;
    this.koywe_url = koywe_url;
  }

  async createReference(
    depositParams: CreateReferenceRequest,
    transferParams: KoyweReferenceParams,
  ): Promise<JsonData> {
    const { amount: beforeConvertAmount, id } = depositParams;
    const { wallet_address, asset_transfer_method_id } = transferParams;

    const userDetails = await this.userService.getUserInfo(id);
    await this.koyweTokenManager.getToken(userDetails.email);
    const { currency_type } = countriesData[userDetails.country_code];

    const convertData = await lastValueFrom(
      this.httpService.get(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${currency_type}`),
    );

    const convertedAmount = parseFloat(beforeConvertAmount) * parseFloat(convertData.data[currency_type]);

    const amount = String(convertedAmount.toFixed(2));

    const { quoteId } = await this.createQuote({ amount, currency: currency_type, method: transferParams.method });
    const { orderId, providedAddress } = await this.createOrder(quoteId, userDetails.email, wallet_address);
    const { status, koyweFee, networkFee } = await this.koyweMainManager.getOrderInfo(orderId);
    const fee = String(networkFee + koyweFee);
    await this.depositEntityRepository.save(
      this.depositEntityRepository.create({
        user_id: id,
        uuid: orderId,
        type: 'deposit',
        amount,
        provider: Providers.KOYWE,
        currency_type,
        status: status.toLowerCase(),
        fee,
      }),
    );
    const parts = providedAddress.split('\n');

    const data: ReferenceData = {
      name: parts[0],
      account_number: parts[1],
      tax_id: parts[2],
      bank: parts[3],
      email: parts[4],
      amount,
      currency_type,
      asset_transfer_method_id,
      wallet_address,
    };

    return { data: JSON.stringify([data]) };
  }

  async createQuote(params: { amount: string; currency: string; method?: KoywePaymentMethod }): Promise<KoyweQuote> {
    try {
      const paymentMethodId = await this.koyweMainManager.getPaymentMethodId(params.currency, params.method);

      const formData = {
        symbolIn: params.currency,
        symbolOut: this.asset,
        amountIn: params.amount,
        paymentMethodId,
        executable: true,
      };

      const result = await lastValueFrom(this.httpService.post(`${this.koywe_url}/quotes`, formData));

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }

  async createOrder(quoteId: string, email: string, wallet_address: string): Promise<KoyweCreateOrder> {
    try {
      const token = await this.redis.get('koywe_token');
      const formData = {
        destinationAddress: wallet_address,
        quoteId,
        email,
        metadata: 'Deposit funds',
      };
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const result = await lastValueFrom(
        this.httpService.post(`${this.koywe_url}/orders`, formData, { headers: headersRequest }),
      );

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
