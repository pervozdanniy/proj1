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
import { TransfersEntity } from '../../../entities/transfers.entity';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
import { CurrencyService } from '../../currency.service';
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

      const beforeConvertAmount = transactionResponse.data.data.value;
      const currency_type = transactionResponse.data.data.currency;
      const ratesData = await this.currencyService.rate;
      const amount = Number((beforeConvertAmount / ratesData.get(currency_type)).toFixed(2));

      const documentNumber = transactionResponse.data.data.source_document_number;
      const { user_id } = await this.documentRepository.findOneBy({ document_number: documentNumber });

      const currentTransfer = await this.depositEntityRepository.findOneBy({ uuid: transactionId });
      if (!currentTransfer) {
        const payload = {
          user_id,
          uuid: transactionId,
          type: 'deposit',
          amount: amount,
          provider: Providers.FACILITA,
          currency_type: 'USD',
          status: transactionResponse.data.data.status,
          fee: 0,
        };

        await this.depositEntityRepository.save(this.depositEntityRepository.create(payload));
      }
    } catch (e) {
      throw new GrpcException(Status.ABORTED, 'Facilita create user error!', 400);
    }

    return { success: true };
  }
}
