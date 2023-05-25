import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { FacilitaWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
import { CurrencyService } from '../../currency.service';
import { facilitaTaxes } from '../constants';
import { FacilitaTokenManager } from './facilita-token.manager';

@Injectable()
export class FacilitaWebhookManager {
  private readonly url: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly facilitaTokenManager: FacilitaTokenManager,
    private readonly httpService: HttpService,

    private readonly currencyService: CurrencyService,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,

    @InjectRepository(VeriffDocumentEntity)
    private readonly documentRepository: Repository<VeriffDocumentEntity>,
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
      const { user_id } = await this.documentRepository.findOneBy({ document_number: documentNumber });
      const { amountUSD, fee } = await this.calculateUSD(amountCurrency, currency_type);

      const currentTransfer = await this.depositEntityRepository.findOneBy({ uuid: transactionId });
      if (!currentTransfer) {
        if (transactionResponse.data.data.status === 'wired' || transactionResponse.data.data.status === 'exchanged')
          await this.depositEntityRepository.save(
            this.depositEntityRepository.create({
              user_id,
              uuid: transactionId,
              type: TransferTypes.DEPOSIT,
              amount: amountCurrency,
              amount_usd: amountUSD,
              provider: Providers.FACILITA,
              currency_type,
              status: TransferStatus.PENDING,
              fee,
            }),
          );
      }
    } catch (e) {
      throw new GrpcException(Status.ABORTED, 'Facilita transaction error!', 400);
    }

    return { success: true };
  }

  async calculateUSD(amountCurrency: number, currency_type: string): Promise<{ fee: number; amountUSD: number }> {
    const ratesData = await this.currencyService.rate;
    const pureRate = ratesData.get(currency_type);
    const { facilita_fee, crypto_settlement, brazil_federal_tax } = facilitaTaxes;

    const step1 = pureRate + (facilita_fee / 100) * pureRate;
    const step2 = step1 + (crypto_settlement / 100) * step1;
    const finalRate = step2 + (brazil_federal_tax / 100) * step2;

    const payed = amountCurrency / pureRate;
    const received = amountCurrency / finalRate;

    const feePercent = (payed - received) / payed;
    const fee = Number(((amountCurrency * feePercent) / 100).toFixed(2));
    const amountUSD = Number((amountCurrency / finalRate).toFixed(2));

    return { amountUSD, fee };
  }
}
