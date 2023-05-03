import { NotificationService } from '@/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { PrimeBalanceManager } from '@/payment-gateway/services/prime_trust/managers/prime-balance.manager';
import { AssetToUSDResponse, SendFundsResponse, UsDtoAssetResponse } from '@/payment-gateway/types/prime-trust';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { TransferFundsRequest, TransferFundsResponse } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';

@Injectable()
export class PrimeFundsTransferManager {
  private readonly prime_trust_url: string;
  private readonly asset_id: string;

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly notificationService: NotificationService,

    private readonly primeBalanceManager: PrimeBalanceManager,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(TransfersEntity)
    private readonly transferFundsEntityRepository: Repository<TransfersEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    const { id } = config.get('asset');
    this.asset_id = id;
    this.prime_trust_url = prime_trust_url;
  }

  async convertUSDtoAsset(account_id: string, amount: string, cancel?: boolean): Promise<UsDtoAssetResponse> {
    const formData = {
      data: {
        type: 'quotes',
        attributes: {
          'account-id': account_id,
          'asset-id': this.asset_id,
          'transaction-type': 'buy',
          amount,
        },
      },
    };

    try {
      const quoteResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/quotes`,
        data: formData,
      });

      if (cancel) {
        return {
          unit_count: quoteResponse.data.data.attributes['unit-count'],
          fee_amount: quoteResponse.data.data.attributes['fee-amount'],
        };
      } else {
        const quote = await this.httpService.request({
          method: 'post',
          url: `${this.prime_trust_url}/v2/quotes/${quoteResponse.data.data.id}/execute`,
          data: null,
        });

        return {
          unit_count: quote.data.data.attributes['unit-count'],
          fee_amount: quote.data.data.attributes['fee-amount'],
        };
      }
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async convertAssetToUSD(account_id: string, amount: string, hotStatus: boolean): Promise<AssetToUSDResponse> {
    const formData = {
      data: {
        type: 'quotes',
        attributes: {
          'account-id': account_id,
          'asset-id': this.asset_id,
          'transaction-type': 'sell',
          amount,
          hot: hotStatus,
        },
      },
    };

    try {
      const createQuoteResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/quotes`,
        data: formData,
      });

      await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/quotes/${createQuoteResponse.data.data.id}/execute`,
        data: null,
      });

      const quoteResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/quotes/${createQuoteResponse.data.data.id}`,
      });

      return {
        trade_id: quoteResponse.data.data.attributes['trade-id'],
        total_amount: quoteResponse.data.data.attributes['total-amount'],
        unit_count: quoteResponse.data.data.attributes['unit-count'],
        fee_amount: quoteResponse.data.data.attributes['fee-amount'],
      };
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async sendFunds(
    fromAccountId: string,
    toAccountId: string,
    unit_count: string,
    hotStatus: boolean,
  ): Promise<SendFundsResponse> {
    try {
      const formData = {
        data: {
          type: 'internal-asset-transfers',
          attributes: {
            'unit-count': unit_count,
            'asset-id': this.asset_id,
            'from-account-id': fromAccountId,
            'to-account-id': toAccountId,
            'hot-transfer': hotStatus,
          },
        },
      };

      const transferFundsResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/internal-asset-transfers`,
        data: formData,
      });

      return {
        uuid: transferFundsResponse.data.data.id,
        status: transferFundsResponse.data.data.attributes['status'],
        created_at: transferFundsResponse.data.data.attributes['created-at'],
      };
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async transferFunds(request: TransferFundsRequest): Promise<TransferFundsResponse> {
    const { sender_id, receiver_id, amount, currency_type } = request;

    const { uuid: fromAccountId } = await this.primeAccountRepository.findOneByOrFail({ user_id: sender_id });
    const { uuid: toAccountId } = await this.primeAccountRepository.findOneByOrFail({ user_id: receiver_id });

    const { unit_count, fee_amount } = await this.convertUSDtoAsset(fromAccountId, amount, true);

    const balance = await this.primeBalanceManager.getAccountBalance(sender_id);
    let hotStatus = false;
    if (parseFloat(balance.cold_balance) < parseFloat(amount) && parseFloat(balance.hot_balance) > parseFloat(amount)) {
      hotStatus = true;
    }
    const { status, created_at, uuid } = await this.sendFunds(fromAccountId, toAccountId, unit_count, hotStatus);

    const payload = {
      fee: fee_amount,
      uuid,
      type: 'transfer',
      user_id: sender_id,
      receiver_id,
      currency_type,
      status,
      amount,
      created_at,
    };

    await this.transferFundsEntityRepository.save(this.transferFundsEntityRepository.create(payload));
    await this.notificationService.sendWs(sender_id, 'balance', 'Balance updated!', 'Balance');
    await this.notificationService.sendWs(receiver_id, 'balance', 'Balance updated!', 'Balance');

    return {
      data: payload,
    };
  }
}
