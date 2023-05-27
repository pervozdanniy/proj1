import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import process from 'process';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  AssetWithdrawalRequest,
  TransferInfo,
  WalletResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { createDate } from '~common/helpers';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import {
  TransfersEntity,
  TransferStatus,
  TransferTypes,
} from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { PrimeBalanceManager } from './prime-balance.manager';
import { PrimeFundsTransferManager } from './prime-funds-transfer.manager';

@Injectable()
export class PrimeAssetsManager {
  private readonly prime_trust_url: string;
  private readonly asset_id: string;
  private readonly asset_type: string;

  private readonly logger = new Logger(PrimeAssetsManager.name);
  private readonly skopaKoyweAccountId: string;

  private readonly skopaAccountId: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,
    private readonly primeBalanceManager: PrimeBalanceManager,

    private readonly primeFundsTransferManager: PrimeFundsTransferManager,
    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    const { skopaKoyweAccountId, skopaAccountId } = config.get('prime_trust', { infer: true });
    const { id, type } = config.get('asset');
    this.asset_id = id;
    this.asset_type = type;
    this.prime_trust_url = prime_trust_url;
    this.skopaKoyweAccountId = skopaKoyweAccountId;
    this.skopaAccountId = skopaAccountId;
  }

  async createWallet(depositParams: CreateReferenceRequest): Promise<WalletResponse> {
    const { user_id, amount_usd } = depositParams;
    const prime_trust_params = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(PrimeTrustContactEntity, 'c', 'a.user_id = c.user_id')
      .where('a.user_id = :user_id', { user_id })
      .select(['a.uuid as account_id', 'c.uuid as contact_id'])
      .getRawOne();

    const { account_id, contact_id } = prime_trust_params;
    const walletPayload = await this.createAssetTransferMethod(account_id, contact_id, amount_usd, 'USD');

    return walletPayload;
  }

  async createAssetTransferMethod(
    account_id: string,
    contact_id: string,
    amount: number,
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

    const amount = assetResponse['unit-count'];
    const type = amount < 0 ? TransferTypes.WITHDRAWAL : TransferTypes.DEPOSIT;

    if (existedDeposit) {
      await this.depositEntityRepository.update({ uuid: resource_id }, { status: assetResponse['status'] });
    } else {
      await this.depositEntityRepository.save(
        this.depositEntityRepository.create({
          user_id,
          uuid: resource_id,
          currency_type: 'USD',
          amount,
          status: assetResponse['status'],
          type,
        }),
      );
    }
    if (account_id === this.skopaAccountId || account_id === this.skopaKoyweAccountId) {
      let transactions;
      if (account_id === this.skopaAccountId) {
        transactions = await this.depositEntityRepository.findBy({
          provider: Providers.FACILITA,
          status: TransferStatus.DELIVERED,
        });
      }
      if (account_id === this.skopaKoyweAccountId) {
        transactions = await this.depositEntityRepository.findBy({
          provider: Providers.KOYWE,
          status: TransferStatus.DELIVERED,
        });
      }
      const sender = await this.primeAccountRepository.findOneBy({ uuid: account_id });

      transactions.map(async (t) => {
        await this.primeFundsTransferManager.transferFunds({
          sender_id: sender.user_id,
          receiver_id: t.user_id,
          amount: t.amount_usd,
          currency_type: 'USD',
        });
        await this.depositEntityRepository.update({ id: t.id }, { status: TransferStatus.SETTLED });
      });
    }

    await this.primeBalanceManager.updateAccountBalance(account_id);

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

  async makeAssetWithdrawal(request: AssetWithdrawalRequest): Promise<TransferInfo> {
    const { id, amount, wallet } = request;
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(PrimeTrustContactEntity, 'c', 'a.user_id = c.user_id')
      .select(['a.uuid as account_id,c.uuid as contact_id'])
      .where('a.user_id = :id', { id })
      .getRawOne();

    if (!accountData) {
      throw new GrpcException(Status.NOT_FOUND, `Account by ${id} id not found`, 400);
    }

    const { account_id, contact_id } = accountData;
    const balance = await this.primeBalanceManager.getAccountBalance(id);
    const hotStatus = balance.cold_balance < amount && balance.hot_balance > amount;

    try {
      const assetTransferMethodResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/asset-transfer-methods`,
        data: {
          data: {
            type: 'asset-transfer-methods',
            attributes: {
              label: 'Personal Wallet Address',
              'asset-id': this.asset_id,
              'contact-id': contact_id,
              'account-id': account_id,
              'wallet-address': wallet,
              'transfer-direction': 'outgoing',
              'asset-transfer-type': 'ethereum',
              'single-use': true,
            },
          },
        },
      });
      const transferMethodId = assetTransferMethodResponse.data.data.id;
      const makeWithdrawalResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/asset-disbursements?include=asset-transfer-method,asset-transfer`,
        data: {
          data: {
            type: 'asset-disbursements',
            attributes: {
              'asset-id': this.asset_id,
              'asset-transfer': {
                'asset-transfer-method-id': transferMethodId,
              },
              'unit-count': amount,
              'account-id': account_id,
              'contact-id': contact_id,
              'hot-transfer': hotStatus,
            },
          },
        },
      });

      let asset_transfer_id: string;
      makeWithdrawalResponse.data.included.map(async (t: { type: string; id: string }) => {
        if (t.type === 'asset-transfers') {
          asset_transfer_id = t.id;
        }
      });

      const getAssetInfo = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/asset-transfers/${asset_transfer_id}?include=disbursement-authorization`,
      });
      const assetData = getAssetInfo.data.data;
      this.logger.debug('Asset Withdrawal', {
        id: assetData.id,
        type: assetData.type,
        attributes: assetData.attributes,
        disbursement_authorization: assetData.relationships['disbursement-authorization'],
      });

      if (process.env.NODE_ENV === 'dev') {
        await this.httpService.request({
          method: 'post',
          url: `${this.prime_trust_url}/v2/disbursement-authorizations/${assetData.relationships['disbursement-authorization'].data.id}/sandbox/verify-owner`,
          data: null,
        });
      }

      return { amount, currency: 'USD', fee: 0 };
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
