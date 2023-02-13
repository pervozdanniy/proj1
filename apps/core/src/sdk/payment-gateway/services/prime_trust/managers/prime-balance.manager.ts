import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { WithdrawalTypes } from '~common/enum/document-types.enum';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  BalanceResponse,
  ContributionResponse,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositParams,
  DepositResponse,
  MakeContributionRequest,
  PrimeTrustData,
  TransferFundsRequest,
  TransferFundsResponse,
  TransferMethodRequest,
  TransferResponse,
  WithdrawalParams,
  WithdrawalResponse,
  WithdrawalsDataResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';
import { BankAccountEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/bank-account.entity';
import { CardResourceEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/card-resource.entity';
import { ContributionEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/contribution.entity';
import { DepositParamsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/deposit-params.entity';
import { PrimeTrustAccountEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { TransferFundsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/transfer-funds.entity';
import { WithdrawalParamsEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal.entity';
import { PrimeTrustHttpService } from '~svc/core/src/sdk/payment-gateway/request/prime-trust-http.service';
import { PrimeBankAccountManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { PrimeKycManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/sdk/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeBalanceManager {
  private readonly logger = new Logger(PrimeBalanceManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly notificationService: NotificationService,

    private readonly primeBankAccountManager: PrimeBankAccountManager,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustBalanceEntity)
    private readonly primeTrustBalanceEntityRepository: Repository<PrimeTrustBalanceEntity>,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async updateAccountBalance(id: string): Promise<SuccessResponse> {
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['a.user_id as user_id'])
      .where('a.uuid = :id', { id })
      .getRawOne();

    if (!accountData) {
      throw new GrpcException(Status.NOT_FOUND, `Account by ${id} id not found`, 400);
    }
    const { user_id } = accountData;

    const cacheData = await this.getBalanceInfo(id);

    return this.saveBalance(user_id, cacheData);
  }

  async getBalanceInfo(account_uuid: string) {
    try {
      const cacheResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/accounts/${account_uuid}?include=account-cash-totals`,
      });

      return cacheResponse.data.included[0].attributes;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async saveBalance(user_id, cacheData) {
    const currentBalance = await this.primeTrustBalanceEntityRepository.findOne({ where: { user_id } });
    const balancePayload = {
      settled: cacheData['settled'],
      disbursable: cacheData['disbursable'],
      pending_transfer: cacheData['pending-transfer'],
      currency_type: cacheData['currency-type'],
      contingent_hold: cacheData['contingent-hold'],
      non_contingent_hold: cacheData['non-contingent-hold'],
    };

    if (!currentBalance) {
      await this.primeTrustBalanceEntityRepository.save(
        this.primeTrustBalanceEntityRepository.create({
          user_id,
          ...balancePayload,
        }),
      );
    } else {
      await this.primeTrustBalanceEntityRepository.update({ user_id }, { ...balancePayload });
    }

    return { success: true };
  }

  async getAccountBalance(id: number): Promise<BalanceResponse> {
    let balance = await this.primeTrustBalanceEntityRepository.findOne({ where: { user_id: id } });

    if (!balance) {
      const account = await this.primeAccountRepository.findOne({ where: { user_id: id } });
      if (!account) {
        throw new GrpcException(Status.NOT_FOUND, `Account for this user not exist!`, 400);
      }
      await this.updateAccountBalance(account.uuid);
      balance = await this.primeTrustBalanceEntityRepository.findOne({ where: { user_id: id } });
    }

    return {
      settled: balance.settled,
      currency_type: balance.currency_type,
    };
  }
}
