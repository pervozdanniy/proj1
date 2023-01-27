import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrimeTrustHttpService } from '~common/axios/prime-trust-http.service';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  BalanceResponse,
  PrimeTrustData,
  TransferMethodRequest,
  WithdrawalParams,
  WithdrawalParamsResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';
import { ContributionEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/contribution.entity';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { WithdrawalParamsEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { WithdrawalEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/withdrawal.entity';
import { PrimeKycManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeWireManager {
  private readonly logger = new Logger(PrimeWireManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly primeKycManager: PrimeKycManager,

    private readonly primeTokenManager: PrimeTokenManager,

    private readonly notificationService: NotificationService,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(PrimeTrustBalanceEntity)
    private readonly primeTrustBalanceEntityRepository: Repository<PrimeTrustBalanceEntity>,

    @InjectRepository(WithdrawalEntity)
    private readonly withdrawalEntityRepository: Repository<WithdrawalEntity>,

    @InjectRepository(ContributionEntity)
    private readonly contributionEntityRepository: Repository<ContributionEntity>,

    @InjectRepository(WithdrawalParamsEntity)
    private readonly withdrawalParamsEntityRepository: Repository<WithdrawalParamsEntity>,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async createReference(userDetails: UserEntity): Promise<PrimeTrustData> {
    const user_id = userDetails.id;
    let refInfo = await this.getReferenceInfo(user_id);
    if (refInfo.data.length == 0) {
      refInfo = await this.createFundsReference(user_id);
    }

    return { data: JSON.stringify(refInfo.data) };
  }

  async getReferenceInfo(user_id: number) {
    const account = await this.primeAccountRepository.findOne({ where: { user_id } });
    try {
      const transferRefResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/contact-funds-transfer-references?account.id=${account.uuid}`,
      });

      return transferRefResponse.data;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async createFundsReference(user_id: number) {
    const account = await this.primeAccountRepository.findOne({ where: { user_id } });
    const contact = await this.primeTrustContactEntityRepository.findOne({ where: { user_id } });
    const formData = {
      data: {
        type: 'contact-funds-transfer-references',
        attributes: {
          'account-id': account.uuid,
          'contact-id': contact.uuid,
        },
      },
    };
    try {
      const transferRefResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/contact-funds-transfer-references`,
        data: formData,
      });

      return transferRefResponse.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
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

  async addWithdrawalParams(request: WithdrawalParams): Promise<WithdrawalParamsResponse> {
    const { id, bank_account_name, bank_account_number, funds_transfer_type, routing_number } = request;
    const contact = await this.primeTrustContactEntityRepository.findOneBy({ user_id: id });
    const transferMethod = await this.withdrawalParamsEntityRepository.findOneBy({
      user_id: id,
      bank_account_number,
      routing_number,
    });
    let transferMethodId;
    if (!transferMethod) {
      transferMethodId = await this.createFundsTransferMethod(request, contact.uuid);
      await this.withdrawalParamsEntityRepository.save(
        this.withdrawalParamsEntityRepository.create({
          user_id: id,
          uuid: transferMethodId,
          routing_number,
          bank_account_name,
          bank_account_number,
          funds_transfer_type,
        }),
      );
    } else {
      transferMethodId = transferMethod.uuid;
    }

    return { transfer_method_id: transferMethodId };
  }

  async createFundsTransferMethod(request: WithdrawalParams, contact_id: string) {
    const { bank_account_name, bank_account_number, funds_transfer_type, routing_number } = request;
    const formData = {
      data: {
        type: 'funds-transfer-methods',
        attributes: {
          'contact-id': contact_id,
          'bank-account-name': bank_account_name,
          'bank-account-number': bank_account_number,
          'routing-number': routing_number,
          'funds-transfer-type': funds_transfer_type,
          role: ['owner'],
        },
      },
    };

    try {
      const fundsResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/funds-transfer-methods?include=bank`,
        data: formData,
      });

      return fundsResponse.data.data.id;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async makeWithdrawal(request: TransferMethodRequest) {
    const { id, funds_transfer_method_id, amount } = request;
    const account = await this.primeAccountRepository.findOneByOrFail({ user_id: id });
    const withdrawalParams = await this.withdrawalParamsEntityRepository.findOneByOrFail({
      uuid: funds_transfer_method_id,
    });

    const withdrawalResponse = await this.sendWithdrawalRequest(request, account.uuid);

    await this.withdrawalEntityRepository.save(
      this.withdrawalEntityRepository.create({
        user_id: id,
        amount,
        uuid: withdrawalResponse.id,
        params_id: withdrawalParams.id,
        status: withdrawalResponse.attributes['status'],
        currency_type: withdrawalResponse.attributes['currency-type'],
      }),
    );

    const notificationPayload = {
      user_id: id,
      title: 'User Disbursements',
      type: 'disbursements',
      description: `Your disbursements status for ${amount} ${withdrawalResponse.attributes['currency-type']} ${withdrawalResponse.attributes['status']}`,
    };

    this.notificationService.createAsync(notificationPayload);

    return { data: JSON.stringify(withdrawalResponse) };
  }

  async sendWithdrawalRequest(request, account_id) {
    const { amount, funds_transfer_method_id } = request;
    const formData = {
      data: {
        type: 'disbursements',
        attributes: {
          'account-id': account_id,
          'funds-transfer-method-id': funds_transfer_method_id,
          amount: amount,
        },
      },
    };

    try {
      const fundsResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/disbursements?include=funds-transfer,disbursement-authorization`,
        data: formData,
      });

      return fundsResponse.data.data;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async updateWithdraw(id: string) {
    const withdrawData = await this.withdrawalEntityRepository
      .createQueryBuilder('w')
      .leftJoinAndSelect(UserEntity, 'u', 'w.user_id = u.id')
      .select(['u.id as user_id'])
      .where('w.uuid = :id', { id })
      .getRawOne();

    const { user_id } = withdrawData;

    const withdrawResponse = await this.getWithdrawInfo(id);

    await this.withdrawalEntityRepository.update(
      { uuid: id },
      {
        status: withdrawResponse['status'],
      },
    );
    const notificationPayload = {
      user_id,
      title: 'User Disbursements',
      type: 'disbursements',
      description: `Your disbursements status for ${withdrawResponse['amount']} ${withdrawResponse['currency-type']} ${withdrawResponse['status']}`,
    };

    this.notificationService.createAsync(notificationPayload);

    return { success: true };
  }

  async getWithdrawInfo(disbursements_id: string) {
    try {
      const withDrawResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/disbursements/${disbursements_id}`,
      });

      return withDrawResponse.data.data.attributes;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async updateContribution(request: AccountIdRequest) {
    const { resource_id, id } = request;
    const contribution = await this.contributionEntityRepository.findOneBy({ uuid: resource_id });
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['u.id as user_id'])
      .where('a.uuid = :id', { id })
      .getRawOne();

    const { user_id } = accountData;

    const contributionResponse = await this.getContributionInfo(resource_id);
    if (!contribution) {
      await this.contributionEntityRepository.save(
        this.contributionEntityRepository.create({
          user_id,
          uuid: resource_id,
          currency_type: contributionResponse['currency-type'],
          amount: contributionResponse['amount'],
          contributor_email: contributionResponse['contributor-email'],
          contributor_name: contributionResponse['contributor-name'],
          funds_transfer_type: contributionResponse['funds-transfer-type'],
          reference: contributionResponse['reference'],
          status: contributionResponse['status'],
        }),
      );
    } else {
      await this.contributionEntityRepository.update({ uuid: resource_id }, { status: contributionResponse['status'] });
    }
    const notificationPayload = {
      user_id,
      title: 'User Contributions',
      type: 'contributions',
      description: `Your contribution status for ${contributionResponse['amount']} ${contributionResponse['currency-type']} ${contributionResponse['status']}`,
    };
    this.notificationService.createAsync(notificationPayload);

    return { success: true };
  }

  private async getContributionInfo(contribution_id: string) {
    try {
      const withDrawResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/contributions/${contribution_id}`,
      });

      return withDrawResponse.data.data.attributes;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }
}
