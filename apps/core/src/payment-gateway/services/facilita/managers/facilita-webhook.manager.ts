import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Fraction from 'fraction.js';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { FacilitaWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { VeriffService } from '../../../modules/veriff/services/veriff.service';
import { CurrencyService } from '../../currency.service';
import { countBrazilRate } from '../facilita-helpers';
import { FacilitaTokenManager } from './facilita-token.manager';

@Injectable()
export class FacilitaWebhookManager {
  private readonly url: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly facilitaTokenManager: FacilitaTokenManager,
    private readonly httpService: HttpService,

    private readonly currencyService: CurrencyService,

    private readonly veriffService: VeriffService,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
  ) {
    const { facilita_url } = config.get('app', { infer: true });
    this.url = facilita_url;
  }

  async facilitaWebhooksHandler({ transactionId }: FacilitaWebhookRequest): Promise<SuccessResponse> {
    const { token } = await this.facilitaTokenManager.getToken();
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const transactionResponse = await lastValueFrom(
        this.httpService.get(`${this.url}/api/v1/transactions/${transactionId}`, { headers: headersRequest }),
      );

      const amountCurrency = transactionResponse.data.data.value;
      const currency_type = transactionResponse.data.data.currency;

      const documentNumber = transactionResponse.data.data.source_document_number;

      const { user_id } = await this.veriffService.getDocumentByNumber(documentNumber);
      const { amount_usd, fee } = await this.calculateUsdFromBrl(amountCurrency, currency_type);

      const currentTransfer = await this.depositEntityRepository.findOneBy({ user_id, uuid: transactionId });
      let currentStatus = TransferStatus.PENDING;
      if (transactionResponse.data.data.status === 'identified') {
        currentStatus = TransferStatus.IDENTIFIED;
      }
      if (transactionResponse.data.data.status === 'wired' || transactionResponse.data.data.status === 'exchanged') {
        currentStatus = TransferStatus.DELIVERED;
      }
      if (!currentTransfer) {
        await this.depositEntityRepository.save(
          this.depositEntityRepository.create({
            user_id,
            uuid: transactionId,
            type: TransferTypes.DEPOSIT,
            amount: amountCurrency,
            amount_usd: amount_usd,
            provider: Providers.FACILITA,
            currency_type,
            status: currentStatus,
            fee,
          }),
        );
      } else {
        await this.depositEntityRepository.update({ uuid: transactionId }, { status: currentStatus });
      }
    } catch (e) {
      throw new GrpcException(Status.ABORTED, 'Facilita transaction error!', 400);
    }

    return { success: true };
  }

  async calculateUsdFromBrl(
    amountCurrency: number,
    currency_type: string,
  ): Promise<{ fee: number; amount_usd: number }> {
    const ratesData = await this.currencyService.waitForRatesUpdate();
    const pureRate = ratesData.get(currency_type);
    const pureRateFraction = new Fraction(ratesData.get(currency_type));
    const finalRateFraction = new Fraction(countBrazilRate(pureRate));
    const amountCurrencyFraction = new Fraction(amountCurrency);

    const feePercentFraction = finalRateFraction.sub(pureRateFraction).div(pureRateFraction).mul(100);

    const feeFraction = Number(amountCurrencyFraction.mul(feePercentFraction).div(100).toString());

    const amount_usdFraction = Number(amountCurrencyFraction.div(finalRateFraction).toString());

    return { amount_usd: amount_usdFraction, fee: feeFraction };
  }
}
