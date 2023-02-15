import { PrimeTrustException } from '@/sdk/payment-gateway/request/exception/prime-trust.exception';
import { PrimeBalanceManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-balance.manager';
import { SendFundsResponse, USDtoAssetResponse } from '@/sdk/payment-gateway/types/response';
import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import {
  TransferFundsRequest,
  TransferFundsResponse,
  TransferResponse,
  UserIdRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { TransferFundsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/transfer-funds.entity';
import { PrimeTrustHttpService } from '~svc/core/src/sdk/payment-gateway/request/prime-trust-http.service';
import { PrimeBankAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

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

    @InjectRepository(TransferFundsEntity)
    private readonly transferFundsEntityRepository: Repository<TransferFundsEntity>,
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
        base_amount: quote.data.data.attributes['base-amount'],
        fee_amount: quote.data.data.attributes['fee-amount'],
        total_amount: quote.data.data.attributes['total-amount'],
        unit_count: quote.data.data.attributes['unit-count'],
      };
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        throw new GrpcException(Status.ABORTED, e.message, 400);
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
        throw new GrpcException(Status.ABORTED, e.message, 400);
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
        throw new GrpcException(Status.ABORTED, e.message, 400);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async transferFunds(request: TransferFundsRequest): Promise<TransferFundsResponse> {
    const { sender_id, receiver_id, amount } = request;

    const { uuid: fromAccountId } = await this.primeAccountRepository.findOneByOrFail({ user_id: sender_id });
    const { uuid: toAccountId } = await this.primeAccountRepository.findOneByOrFail({ user_id: receiver_id });

    const { base_amount, fee_amount, total_amount, unit_count } = await this.convertUSDtoAsset(fromAccountId, amount);

    const { uuid, status, created_at } = await this.sendFunds(fromAccountId, toAccountId, unit_count);

    await this.convertAssetToUSD(toAccountId, amount);
    const payload = {
      sender_id,
      receiver_id,
      uuid,
      currency_type: 'USD',
      status,
      amount,
      created_at,
      base_amount,
      fee_amount,
      total_amount,
      unit_count,
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

  async getTransferById(request: UserIdRequest): Promise<TransferResponse> {
    const { id, resource_id } = request;
    const transferParams = await this.transferFundsEntityRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect(UserDetailsEntity, 's', 's.user_id = t.sender_id')
      .leftJoinAndSelect(UserDetailsEntity, 'r', 'r.user_id = t.receiver_id')
      .where('t.id = :resource_id', { resource_id })
      .where('(t.sender_id = :id OR t.receiver_id = :id)', { id })
      .select([
        `r.first_name as receiver_first_name`,
        `r.last_name as receiver_last_name`,
        `s.first_name as sender_first_name`,
        `s.last_name as sender_last_name`,
        `CONCAT(r.first_name, ' ', r.last_name) as "to"`,
        `CONCAT(s.first_name, ' ', s.last_name) as "from"`,
        `t.amount as amount`,
        `t.currency_type as currency_type`,
        `t.status as status`,
        `t.created_at as created_at`,
      ])
      .getRawOne();
    if (!transferParams) {
      throw new GrpcException(Status.NOT_FOUND, 'Transfer not found!', 404);
    }

    return transferParams;
  }
}
