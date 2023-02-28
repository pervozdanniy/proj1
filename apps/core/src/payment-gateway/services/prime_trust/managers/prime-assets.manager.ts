import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { AccountIdRequest, CreateReferenceRequest, WalletResponse } from '~common/grpc/interfaces/payment-gateway';
import { createDate } from '~common/helpers';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '../../../../notification/services/notification.service';
import { UserEntity } from '../../../../user/entities/user.entity';
import { TransfersEntity } from '../../../entities/prime_trust/transfers.entity';
import { PrimeBalanceManager } from './prime-balance.manager';

@Injectable()
export class PrimeAssetsManager {
  private readonly prime_trust_url: string;
  private readonly asset_id: string;
  private readonly asset_type: string;
  private readonly asset: string;

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly axiosService: HttpService,

    private readonly notificationService: NotificationService,

    private readonly primeBalanceManager: PrimeBalanceManager,
    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    const { id, type, short } = config.get('asset');
    this.asset_id = id;
    this.asset_type = type;
    this.prime_trust_url = prime_trust_url;
    this.asset = short;
  }

  async createWallet(depositParams: CreateReferenceRequest): Promise<WalletResponse> {
    const { id, currency_type, amount } = depositParams;

    const prime_trust_params = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(PrimeTrustContactEntity, 'c', 'a.user_id = c.user_id')
      .where('a.user_id = :id', { id })
      .select(['a.uuid as account_id', 'c.uuid as contact_id'])
      .getRawOne();

    const { account_id, contact_id } = prime_trust_params;
    const walletPayload = await this.createAssetTransferMethod(account_id, contact_id, amount, currency_type);

    return walletPayload;
  }

  async createAssetTransferMethod(
    account_id: string,
    contact_id: string,
    amount: string,
    currency_type: string,
  ): Promise<WalletResponse> {
    const formData = {
      data: {
        type: 'asset-transfer-methods',
        attributes: {
          label: 'Deposit Address',
          'cost-basis': amount,
          'acquisition-on': createDate(),
          'currency-type': currency_type,
          'asset-id': this.asset_id,
          'contact-id': contact_id,
          'account-id': account_id,
          'transfer-direction': 'incoming',
          'single-use': true,
          'asset-transfer-type': this.asset_type,
        },
      },
    };

    try {
      const walletResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/asset-transfer-methods`,
        data: formData,
      });

      return {
        wallet_address: walletResponse.data.data.attributes['wallet-address'],
        asset_transfer_method_id: walletResponse.data.data.id,
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

  async updateAssetDeposit(request: AccountIdRequest): Promise<SuccessResponse> {
    const { resource_id, id: account_id } = request;
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['u.id as user_id'])
      .where('a.uuid = :account_id', { account_id })
      .getRawOne();

    const { user_id } = accountData;
    const assetResponse = await this.getAssetResponse(resource_id);
    const existedDeposit = await this.depositEntityRepository.findOneBy({ uuid: resource_id });
    const convertData = await lastValueFrom(
      this.axiosService.get(`https://min-api.cryptocompare.com/data/price?fsym=${this.asset}&tsyms=USD`),
    );
    const convertedAmount = parseFloat(convertData.data['USD']) * parseFloat(assetResponse['unit-count']);

    const amount = String(convertedAmount.toFixed(2));
    if (existedDeposit) {
      await this.depositEntityRepository.update({ uuid: resource_id }, { status: assetResponse['status'] });
    } else {
      const assetPayload = {
        user_id,
        uuid: resource_id,
        currency_type: 'USD',
        amount,
        status: assetResponse['status'],
        param_type: 'asset',
        type: 'deposit',
      };
      await this.depositEntityRepository.save(this.depositEntityRepository.create(assetPayload));
    }
    await this.primeBalanceManager.updateAccountBalance(account_id);

    const notificationPayload = {
      user_id,
      title: 'User Contributions',
      type: 'contributions',
      description: `Your contribution status for ${amount} USD ${assetResponse['status']}`,
    };
    this.notificationService.createAsync(notificationPayload);

    return { success: true };

    return { success: true };
  }

  async getAssetResponse(resource_id: string) {
    try {
      const assetResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/asset-transfers/${resource_id}`,
      });

      return assetResponse.data.data.attributes;
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }
}
