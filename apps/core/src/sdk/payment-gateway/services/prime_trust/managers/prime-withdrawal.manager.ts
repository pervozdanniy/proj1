import { NotificationService } from '@/notification/services/notification.service';
import { BankAccountEntity } from '@/sdk/payment-gateway/entities/prime_trust/bank-account.entity';
import { PrimeTrustAccountEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustBalanceEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-balance.entity';
import { PrimeTrustContactEntity } from '@/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { WithdrawalParamsEntity } from '@/sdk/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { PrimeTrustException } from '@/sdk/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/sdk/payment-gateway/request/prime-trust-http.service';
import { PrimeBankAccountManager } from '@/sdk/payment-gateway/services/prime_trust/managers/prime-bank-account.manager';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { WithdrawalTypes } from '~common/enum/document-types.enum';
import {
  TransferMethodRequest,
  UserIdRequest,
  WithdrawalDataResponse,
  WithdrawalParams,
  WithdrawalResponse,
  WithdrawalsDataResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '../../../entities/prime_trust/transfers.entity';

@Injectable()
export class PrimeWithdrawalManager {
  private readonly logger = new Logger(PrimeWithdrawalManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly notificationService: NotificationService,

    private readonly primeBankAccountManager: PrimeBankAccountManager,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(PrimeTrustBalanceEntity)
    private readonly primeTrustBalanceEntityRepository: Repository<PrimeTrustBalanceEntity>,

    @InjectRepository(TransfersEntity)
    private readonly withdrawalEntityRepository: Repository<TransfersEntity>,

    @InjectRepository(WithdrawalParamsEntity)
    private readonly withdrawalParamsEntityRepository: Repository<WithdrawalParamsEntity>,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async addWithdrawalParams(request: WithdrawalParams): Promise<WithdrawalResponse> {
    const { id, bank_account_id, funds_transfer_type } = request;
    await this.checkBankExists(id, bank_account_id);
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
        },
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
      this.logger.error(e.response.data);

      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
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
        status: withdrawalResponse.attributes['status'],
        currency_type: withdrawalResponse.attributes['currency-type'],
        param_type: 'withdrawal_param',
        param_id: withdrawalParams.id,
        type: 'withdrawal',
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

      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
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

      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async getWithdrawalParams(id: number): Promise<WithdrawalsDataResponse> {
    const params = await this.withdrawalParamsEntityRepository
      .createQueryBuilder('w')
      .leftJoinAndSelect(BankAccountEntity, 'b', 'b.id = w.bank_account_id')
      .where('w.user_id = :id', { id })
      .select([
        'w.id as id',
        'w.uuid as transfer_method_id',
        'b.bank_account_number as bank_account_number',
        'b.routing_number as routing_number',
        'w.funds_transfer_type as funds_transfer_type',
        'b.bank_account_name as bank_account_name',
      ])
      .getRawMany();

    return { data: params };
  }

  async checkBankExists(user_id: number, bank_id: number) {
    const banks = await this.primeBankAccountManager.getBankAccounts(user_id);
    const data = banks.data.filter((b) => b.id === bank_id);
    if (data.length === 0) {
      throw new GrpcException(Status.ABORTED, 'Bank account does`nt exist!', 400);
    }
  }

  async getWithdrawalById(request: UserIdRequest): Promise<WithdrawalDataResponse> {
    const { id, resource_id } = request;
    const withdrawal = await this.withdrawalEntityRepository
      .createQueryBuilder('w')
      .select('*')
      .where('w.id = :resource_id AND w.user_id=:id', { resource_id, id })
      .getRawOne();
    if (!withdrawal) {
      throw new GrpcException(Status.NOT_FOUND, 'Withdrawal not found!', 404);
    }

    return withdrawal;
  }
}
