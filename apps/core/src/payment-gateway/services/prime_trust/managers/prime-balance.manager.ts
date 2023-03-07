import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { BalanceAttributes } from '@/payment-gateway/types/prime-trust';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class PrimeBalanceManager {
  private readonly prime_trust_url: string;

  private readonly asset: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly axiosService: HttpService,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustBalanceEntity)
    private readonly primeTrustBalanceEntityRepository: Repository<PrimeTrustBalanceEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    const { short } = config.get('asset');
    this.prime_trust_url = prime_trust_url;
    this.asset = short;
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
    const convertData = await lastValueFrom(
      this.axiosService.get(`https://min-api.cryptocompare.com/data/price?fsym=${this.asset}&tsyms=USD`),
    );
    const convertedAmount = parseFloat(convertData.data['USD']) * parseFloat(cacheData.settled);

    cacheData.settled = String(convertedAmount.toFixed(2));

    return this.saveBalance(user_id, cacheData);
  }

  async getBalanceInfo(account_uuid: string): Promise<BalanceAttributes> {
    try {
      const cacheResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/accounts/${account_uuid}?include=account-asset-totals`,
      });
      const attributes = cacheResponse.data.included[0].attributes;

      return {
        settled: attributes['settled'],
        'currency-type': 'USD',
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

  async saveBalance(user_id: number, cacheData: BalanceAttributes): Promise<SuccessResponse> {
    const currentBalance = await this.primeTrustBalanceEntityRepository.findOne({ where: { user_id } });
    const balancePayload = {
      settled: cacheData.settled,
      currency_type: cacheData['currency-type'],
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

  async getAccountBalance(id: number) {
    const account = await this.primeAccountRepository.findOne({ where: { user_id: id } });
    if (!account) {
      throw new GrpcException(Status.NOT_FOUND, `Account for this user not exist!`, 400);
    }
    await this.updateAccountBalance(account.uuid);
    const balance = await this.primeTrustBalanceEntityRepository.findOne({ where: { user_id: id } });

    return {
      settled: balance.settled,
      currency_type: balance.currency_type,
    };
  }
}
