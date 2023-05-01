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
import process from 'process';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { AccountIdRequest } from '~common/grpc/interfaces/payment-gateway';
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

    cacheData.settled = String((parseFloat(convertData.data['USD']) * parseFloat(cacheData.settled)).toFixed(2));
    cacheData.hot_balance = String(
      (parseFloat(convertData.data['USD']) * parseFloat(cacheData.hot_balance)).toFixed(2),
    );
    cacheData.cold_balance = String(
      (parseFloat(convertData.data['USD']) * parseFloat(cacheData.cold_balance)).toFixed(2),
    );

    return this.saveBalance(user_id, cacheData);
  }

  async getBalanceInfo(account_uuid: string): Promise<BalanceAttributes> {
    try {
      const cacheResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/accounts/${account_uuid}?include=account-asset-totals`,
      });
      let balance = '0';
      let cold_balance = '0';
      let hot_balance = '0';
      if (cacheResponse.data.included.length !== 0) {
        const attributes = cacheResponse.data.included[0].attributes;
        balance = attributes['settled'];
        cold_balance = attributes['settled-cold'];
        hot_balance = attributes['settled-hot'];
      }

      return {
        settled: balance,
        cold_balance,
        hot_balance,
        currency_type: 'USD',
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
      hot_balance: cacheData.hot_balance,
      cold_balance: cacheData.cold_balance,
      currency_type: cacheData.currency_type,
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

  async getAccountBalance(id: number): Promise<BalanceAttributes> {
    const account = await this.primeAccountRepository.findOne({ where: { user_id: id } });
    if (!account) {
      throw new GrpcException(Status.NOT_FOUND, `Account for this user not exist!`, 400);
    }
    await this.updateAccountBalance(account.uuid);
    const balance = await this.primeTrustBalanceEntityRepository.findOne({ where: { user_id: id } });

    return {
      settled: balance.settled,
      hot_balance: balance.hot_balance,
      cold_balance: balance.cold_balance,
      currency_type: balance.currency_type,
    };
  }

  async fundsTransfer(request: AccountIdRequest): Promise<SuccessResponse> {
    const { resource_id, id: account_id } = request;
    if (process.env.NODE_ENV === 'dev') {
      try {
        const fundsTransferResponse = await this.httpService.request({
          method: 'get',
          url: `${this.prime_trust_url}/v2/funds-transfers/${resource_id}`,
        });
        if (
          fundsTransferResponse.data.data.attributes['contingencies-cleared-on'] &&
          fundsTransferResponse.data.data.attributes['status'] === 'pending'
        ) {
          await this.httpService.request({
            method: 'post',
            url: `${this.prime_trust_url}/v2/funds-transfers/${resource_id}/sandbox/settle`,
            data: null,
          });
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
    await this.updateAccountBalance(account_id);

    return { success: true };
  }
}
