import { NotificationService } from '@/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustException } from '@/sdk/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/sdk/payment-gateway/request/prime-trust-http.service';
import { PrimeBalanceManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-balance.manager';
import { PrimeBankAccountManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { CreateReferenceRequest, WalletResponse } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class PrimeAssetsManager {
  private readonly logger = new Logger(PrimeAssetsManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;
  private readonly asset_id: string;
  private readonly asset_type: string;

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
  ) {
    const { prime_trust_url, domain } = config.get('app');
    const { id, type } = config.get('asset');
    this.asset_id = id;
    this.asset_type = type;
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async createWallet(depositParams: CreateReferenceRequest): Promise<WalletResponse> {
    let { amount, currency_type } = depositParams;
    const { id } = depositParams;

    if (currency_type === 'CLP') {
      amount = (parseFloat(amount) * 0.0012).toString();
      currency_type = 'USD';
    }
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

  createDate() {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    return formattedDate;
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
          'acquisition-on': this.createDate(),
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
}
