import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { PayfuraWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';

@Injectable()
export class PayfuraWebhookManager {
  private readonly payfura_url: string;
  private readonly payfura_secret: string;
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(TransfersEntity)
    private readonly transfersEntityRepository: Repository<TransfersEntity>,
    config: ConfigService<ConfigInterface>,
  ) {
    const { payfura_url } = config.get('app');
    const { secret } = config.get('payfura');
    this.payfura_secret = secret;
    this.payfura_url = payfura_url;
  }

  async payfuraWebhooksHandler({ orderId }: PayfuraWebhookRequest): Promise<SuccessResponse> {
    const headersRequest = {
      Authorization: `Bearer ${this.payfura_secret}`,
    };

    try {
      const getOrderResponse = await lastValueFrom(
        this.httpService.get(`${this.payfura_url}/v1/partner/order?orderId=${orderId}`, {
          headers: headersRequest,
        }),
      );
      await this.transfersEntityRepository.update(
        { uuid: orderId },
        { status: getOrderResponse.data.status.toLowerCase() },
      );

      return { success: true };
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
