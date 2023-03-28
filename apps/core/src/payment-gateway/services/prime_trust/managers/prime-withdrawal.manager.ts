import { NotificationService } from '@/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { WithdrawalParamsEntity } from '@/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { PrimeBankAccountManager } from '@/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { WithdrawalTypes } from '~common/enum/document-types.enum';
import {
  AccountIdRequest,
  JsonData,
  TransferMethodRequest,
  WithdrawalParams,
  WithdrawalResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { PrimeBalanceManager } from './prime-balance.manager';
import { PrimeFundsTransferManager } from './prime-funds-transfer.manager';

@Injectable()
export class PrimeWithdrawalManager {
  private readonly prime_trust_url: string;

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,
    private readonly notificationService: NotificationService,
    private readonly primeBankAccountManager: PrimeBankAccountManager,
    private readonly primeFundsTransferManager: PrimeFundsTransferManager,
    private readonly primeBalanceManager: PrimeBalanceManager,
    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,
    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,
    @InjectRepository(TransfersEntity)
    private readonly withdrawalEntityRepository: Repository<TransfersEntity>,
    @InjectRepository(WithdrawalParamsEntity)
    private readonly withdrawalParamsEntityRepository: Repository<WithdrawalParamsEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    this.prime_trust_url = prime_trust_url;
  }

  async addWithdrawalParams(request: WithdrawalParams): Promise<WithdrawalResponse> {
    const { id, bank_account_id, funds_transfer_type } = request;
    await this.checkBankExists(bank_account_id);
    const contact = await this.primeTrustContactEntityRepository.findOneBy({ user_id: id });
    const transferMethod = await this.withdrawalParamsEntityRepository.findOneBy({
      user_id: id,
      bank_account_id,
      funds_transfer_type,
    });
    let transferMethodId;
    if (!transferMethod) {
      transferMethodId = await this.createFundsTransferMethod(request, contact.uuid);
      await this.withdrawalParamsEntityRepository.save(
        this.withdrawalParamsEntityRepository.create({
          user_id: id,
          uuid: transferMethodId,
          bank_account_id,
          funds_transfer_type,
        }),
      );
    } else {
      transferMethodId = transferMethod.uuid;
    }

    return { transfer_method_id: transferMethodId };
  }

  async createFundsTransferMethod(request: WithdrawalParams, contact_id: string) {
    const { bank_account_id, funds_transfer_type } = request;
    const { bank_account_name, routing_number, bank_account_number, type, ach_check_type } =
      await this.primeBankAccountManager.getBankAccountById(bank_account_id);
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
        } as Record<string, any>,
      },
    };
    if (funds_transfer_type === WithdrawalTypes.WIRE) {
      formData.data.attributes['funds-transfer-type'] = funds_transfer_type;
      formData.data.attributes['role'] = ['owner'];
    }

    if (funds_transfer_type === WithdrawalTypes.ACH) {
      formData.data.attributes['funds-transfer-type'] = funds_transfer_type;
      formData.data.attributes['ach-check-type'] = ach_check_type;
      formData.data.attributes['bank-account-type'] = type;
    }

    try {
      const fundsResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/funds-transfer-methods?include=bank`,
        data: formData,
      });

      return fundsResponse.data.data.id;
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<JsonData> {
    const { id, bank_account_id, funds_transfer_type, amount } = request;
    const { transfer_method_id: funds_transfer_method_id } = await this.addWithdrawalParams({
      id,
      bank_account_id,
      funds_transfer_type,
    });
    const account = await this.primeAccountRepository.findOneByOrFail({ user_id: id });
    const withdrawalParams = await this.withdrawalParamsEntityRepository.findOneByOrFail({
      uuid: funds_transfer_method_id,
    });

    const { funds: fundsResponse, fee } = await this.sendWithdrawalRequest(
      request,
      account.uuid,
      funds_transfer_method_id,
    );

    await this.withdrawalEntityRepository.save(
      this.withdrawalEntityRepository.create({
        user_id: id,
        amount,
        uuid: fundsResponse.id,
        status: fundsResponse.attributes['status'],
        currency_type: fundsResponse.attributes['currency-type'],
        param_type: 'withdrawal_param',
        param_id: withdrawalParams.id,
        fee,
        type: 'withdrawal',
      }),
    );

    const notificationPayload = {
      user_id: id,
      title: 'User Disbursements',
      type: 'disbursements',
      description: `Your disbursements status for ${amount} ${fundsResponse.attributes['currency-type']} ${fundsResponse.attributes['status']}`,
    };

    this.notificationService.createAsync(notificationPayload);

    const response = {
      id: fundsResponse.relationships['funds-transfer'].data.id,
      type: fundsResponse.relationships['funds-transfer'].data.type,
      attributes: fundsResponse.attributes,
      disbursement_authorization: fundsResponse.relationships['disbursement-authorization'],
    };

    return { data: JSON.stringify(response) };
  }

  async sendWithdrawalRequest(request: TransferMethodRequest, account_id: string, funds_transfer_method_id: string) {
    const { amount } = request;
    const { total_amount, fee_amount } = await this.primeFundsTransferManager.convertAssetToUSD(account_id, amount);

    const formData = {
      data: {
        type: 'disbursements',
        attributes: {
          'account-id': account_id,
          'funds-transfer-method-id': funds_transfer_method_id,
          amount: total_amount,
        },
      },
    };

    try {
      const fundsResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/disbursements?include=funds-transfer,disbursement-authorization`,
        data: formData,
      });

      return { funds: fundsResponse.data.data, fee: fee_amount };
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async updateWithdraw(request: AccountIdRequest) {
    const { resource_id, id: account_id } = request;
    const withdrawData = await this.withdrawalEntityRepository
      .createQueryBuilder('w')
      .leftJoinAndSelect(UserEntity, 'u', 'w.user_id = u.id')
      .select(['u.id as user_id'])
      .where('w.uuid = :id', { id: resource_id })
      .andWhere('w.type = :type', { type: 'withdrawal' })
      .getRawOne();
    if (!withdrawData) {
      return { success: false };
    }

    const { user_id } = withdrawData;

    const withdrawResponse = await this.getWithdrawInfo(resource_id);

    await this.withdrawalEntityRepository.update(
      { uuid: resource_id },
      {
        status: withdrawResponse['status'],
      },
    );

    await this.primeBalanceManager.updateAccountBalance(account_id);

    const notificationPayload = {
      user_id,
      title: 'User Disbursements',
      type: 'disbursements',
      description: `Your disbursements status for ${withdrawResponse['amount']} ${withdrawResponse['currency-type']} ${withdrawResponse['status']}`,
    };

    await this.notificationService.create(notificationPayload);

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
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async checkBankExists(bank_id: number) {
    const bank = await this.primeBankAccountManager.getBankAccountById(bank_id);
    if (!bank) {
      throw new GrpcException(Status.ABORTED, 'Bank account does`nt exist!', 400);
    }
  }
}
