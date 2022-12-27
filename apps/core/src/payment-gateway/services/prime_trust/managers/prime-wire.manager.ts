import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { BalanceResponse, PrimeTrustData, SuccessResponse } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
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
    private readonly httpService: HttpService,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(PrimeTrustBalanceEntity)
    private readonly primeTrustBalanceEntityRepository: Repository<PrimeTrustBalanceEntity>,

    @Inject(PrimeKycManager)
    private readonly primeKycManager: PrimeKycManager,

    @Inject(PrimeTokenManager)
    private readonly primeTokenManager: PrimeTokenManager,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async createReference(userDetails: UserEntity, token: string): Promise<PrimeTrustData> {
    const user_id = userDetails.id;
    let refInfo = await this.getReferenceInfo(user_id, token);
    if (refInfo.data.length == 0) {
      refInfo = await this.createFundsReference(user_id, token);
    }

    return { data: JSON.stringify(refInfo.data) };
  }

  async getReferenceInfo(user_id: number, token: string) {
    const account = await this.primeAccountRepository.findOne({ where: { user_id } });
    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const transferRefResponse = await lastValueFrom(
        this.httpService.get(
          `${this.prime_trust_url}/v2/contact-funds-transfer-references?account.id=${account.uuid}`,
          {
            headers: headersRequest,
          },
        ),
      );

      return transferRefResponse.data;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async createFundsReference(user_id: number, token: string) {
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

    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const transferRefResponse = await lastValueFrom(
        this.httpService.post(`${this.prime_trust_url}/v2/contact-funds-transfer-references`, formData, {
          headers: headersRequest,
        }),
      );

      return transferRefResponse.data;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async updateAccountBalance(id: string): Promise<SuccessResponse> {
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(PrimeTrustUserEntity, 'p', 'a.user_id = p.user_id')
      .leftJoinAndSelect('p.skopa_user', 'u')
      .select(['a.user_id as user_id,u.email as email,p.password as password'])
      .where('a.uuid = :id', { id })
      .getRawMany();

    if (accountData.length == 0) {
      throw new GrpcException(Status.NOT_FOUND, `Account by ${id} id not found`, 400);
    }
    const user_id = accountData[0].user_id;

    const userDetails = {
      email: accountData[0].email,
      prime_user: { password: accountData[0].password },
    };

    const cacheData = await this.getBalanceInfo(userDetails);

    return await this.saveBalance(user_id, cacheData);
  }

  async getBalanceInfo(userDetails) {
    const { token } = await this.primeTokenManager.getToken(userDetails);
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const cacheResponse = await lastValueFrom(
        this.httpService.get(`${this.prime_trust_url}/v2/account-cash-totals`, {
          headers: headersRequest,
        }),
      );

      return cacheResponse.data.data[0].attributes;
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
    const balance = await this.primeTrustBalanceEntityRepository.findOne({ where: { user_id: id } });

    return {
      settled: balance.settled,
      currency_type: balance.currency_type,
    };
  }
}
