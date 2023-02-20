import { NotificationService } from '@/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustException } from '@/sdk/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/sdk/payment-gateway/request/prime-trust-http.service';
import { PrimeBalanceManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-balance.manager';
import { PrimeBankAccountManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { SendFundsResponse, USDtoAssetResponse } from '@/sdk/payment-gateway/types/response';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { TransferFundsRequest, TransferFundsResponse } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '../../../entities/prime_trust/transfers.entity';

@Injectable()
export class PrimeFundsTransferManager {
  private readonly logger = new Logger(PrimeFundsTransferManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;

  private readonly asset_id: string = 'ecca8bab-dcb2-419a-973e-aebc39ff4f03';
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly notificationService: NotificationService,

    private readonly primeBankAccountManager: PrimeBankAccountManager,

    private readonly primeBalanceManager: PrimeBalanceManager,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(PrimeTrustBalanceEntity)
    private readonly primeTrustBalanceEntityRepository: Repository<PrimeTrustBalanceEntity>,

    @InjectRepository(TransfersEntity)
    private readonly transferFundsEntityRepository: Repository<TransfersEntity>,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async convertUSDtoAsset(account_id: string, amount: string): Promise<USDtoAssetResponse> {
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

      const quote = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/quotes/${quoteResponse.data.data.id}/execute`,
        data: null,
      });

      return {
        unit_count: quote.data.data.attributes['unit-count'],
        fee_amount: quote.data.data.attributes['fee-amount'],
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

  async convertAssetToUSD(account_id: string, amount: string): Promise<void> {
    const formData = {
      data: {
        type: 'quotes',
        attributes: {
          'account-id': account_id,
          'asset-id': this.asset_id,
          'transaction-type': 'sell',
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

      await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/quotes/${quoteResponse.data.data.id}/execute`,
        data: null,
      });
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async sendFunds(fromAccountId: string, toAccountId: string, unit_count: string): Promise<SendFundsResponse> {
    try {
      const formData = {
        data: {
          type: 'internal-asset-transfers',
          attributes: {
            'unit-count': unit_count,
            'asset-id': this.asset_id,
            'from-account-id': fromAccountId,
            'to-account-id': toAccountId,
            reference: 'For Trade Settlement',
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

    const { unit_count, fee_amount } = await this.convertUSDtoAsset(fromAccountId, amount);

    const { status, created_at, uuid } = await this.sendFunds(fromAccountId, toAccountId, unit_count);

    await this.convertAssetToUSD(toAccountId, amount);
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
    await this.createTransferFundsNotification(
      sender_id,
      `Sending ${payload.amount} ${payload.currency_type} ${payload.status}`,
    );

    await this.createTransferFundsNotification(
      receiver_id,
      `Received ${payload.amount} ${payload.currency_type} ${payload.status}`,
    );

    return {
      data: payload,
    };
  }

  async createTransferFundsNotification(id: number, description: string) {
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['a.uuid as account_id'])
      .where('a.user_id = :id', { id })
      .getRawOne();
    const { account_id } = accountData;

    const balanceData = await this.primeBalanceManager.getBalanceInfo(account_id);

    const notificationPayload = {
      user_id: id,
      title: 'Funds Transfer',
      type: 'transfer_funds',
      description: `${description}. Your current balance is ${balanceData['settled']} ${balanceData['currency-type']}`,
    };

    this.notificationService.createAsync(notificationPayload);
  }
}
