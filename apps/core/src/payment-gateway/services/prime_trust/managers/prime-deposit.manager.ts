import { NotificationService } from '@/notification/services/notification.service';
import { BankAccountEntity } from '@/payment-gateway/entities/prime_trust/bank-account.entity';
import { CardResourceEntity } from '@/payment-gateway/entities/prime_trust/card-resource.entity';
import { DepositParamsEntity } from '@/payment-gateway/entities/prime_trust/deposit-params.entity';
import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { TransfersEntity } from '@/payment-gateway/entities/prime_trust/transfers.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { DepositTypes } from '~common/enum/document-types.enum';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  ContributionResponse,
  CreateReferenceRequest,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositDataResponse,
  DepositParamRequest,
  DepositParamsResponse,
  DepositResponse,
  JsonData,
  MakeContributionRequest,
  UserIdRequest,
  WithdrawalParams,
} from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { PrimeBalanceManager } from './prime-balance.manager';
import { PrimeBankAccountManager } from './prime-bank-account.manager';
import { PrimeFundsTransferManager } from './prime-funds-transfer.manager';

@Injectable()
export class PrimeDepositManager {
  private readonly prime_trust_url: string;

  private readonly fee_percentage: number = 2;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly notificationService: NotificationService,

    private readonly primeBankAccountManager: PrimeBankAccountManager,

    private readonly primeBalanceManager: PrimeBalanceManager,

    private readonly primeFundsTransferManager: PrimeFundsTransferManager,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,

    @InjectRepository(DepositParamsEntity)
    private readonly depositParamsEntityRepository: Repository<DepositParamsEntity>,

    @InjectRepository(CardResourceEntity)
    private readonly cardResourceEntityRepository: Repository<CardResourceEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    this.prime_trust_url = prime_trust_url;
  }

  async createReference(request: CreateReferenceRequest): Promise<JsonData> {
    let refInfo = await this.getReferenceInfo(request.id);
    if (refInfo.data.length == 0) {
      refInfo = await this.createFundsReference(request.id);
    }
    const newData = [];
    for (let i = 0; i < refInfo.data.length; i++) {
      const attributes = refInfo.data[i].attributes;
      for (const key in attributes) {
        if (key.includes('wire')) {
          newData.push(attributes[key]);
        }
      }
    }
    newData.push({ 'contact-funds-transfer-references': refInfo.data[0].id });

    return { data: JSON.stringify(newData) };
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
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
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
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
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
    if (funds_transfer_type === DepositTypes.WIRE) {
      formData.data.attributes['funds-transfer-type'] = funds_transfer_type;
      formData.data.attributes['role'] = ['owner'];
    }

    if (funds_transfer_type === DepositTypes.ACH) {
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

  async updateContribution(request: AccountIdRequest): Promise<SuccessResponse> {
    const { resource_id, id: account_id } = request;
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['u.id as user_id'])
      .where('a.uuid = :account_id', { account_id })
      .getRawOne();

    const { user_id } = accountData;

    const contributionResponse = await this.getContributionInfo(resource_id);
    const existedDeposit = await this.depositEntityRepository.findOneBy({ uuid: resource_id });

    const amount = (
      parseFloat(contributionResponse['amount']) -
      parseFloat(contributionResponse['amount']) * this.fee_percentage * 0.01
    ).toString();

    await this.primeFundsTransferManager.convertUSDtoAsset(account_id, amount, false);
    if (existedDeposit) {
      await this.depositEntityRepository.update(
        { uuid: resource_id },
        { status: contributionResponse['status'], amount: amount },
      );
    } else {
      const contributionPayload = {
        user_id,
        uuid: resource_id,
        currency_type: contributionResponse['currency-type'],
        amount,
        status: contributionResponse['status'],
        param_type: contributionResponse['payment-type'],
        type: 'deposit',
      };
      await this.depositEntityRepository.save(this.depositEntityRepository.create(contributionPayload));
    }

    await this.primeBalanceManager.updateAccountBalance(account_id);

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
      const contributionResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/contributions/${contribution_id}`,
      });

      return contributionResponse.data.data.attributes;
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async createCreditCardResource(id: number): Promise<CreditCardResourceResponse> {
    const contact = await this.primeTrustContactEntityRepository.findOneByOrFail({ user_id: id });
    const params = await this.getCreditCardResource(contact.uuid);
    const cardResource = await this.cardResourceEntityRepository.save(
      this.cardResourceEntityRepository.create({
        user_id: id,
        uuid: params.id,
        token: params.attributes.token,
        status: params.attributes.status,
      }),
    );

    return {
      resource_id: cardResource.uuid,
      resource_token: cardResource.token,
    };
  }

  async getCreditCardResource(contact_id: string) {
    try {
      const formData = {
        data: {
          type: 'credit-card-resource',
          attributes: {
            'contact-id': contact_id,
          },
        },
      };
      const cardResourceResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/credit-card-resources`,
        data: formData,
      });

      const response = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/credit-card-resources/${cardResourceResponse.data.data.id}/token`,
        data: null,
      });

      return response.data.data;
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async verifyCreditCard(resource_id: string): Promise<SuccessResponse> {
    try {
      const cardResourceResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/credit-card-resources/${resource_id}`,
      });

      const cardAttributes = cardResourceResponse.data.data.attributes;
      const transferMethodResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/funds-transfer-methods/${cardAttributes['funds-transfer-method-id']}?include=credit-card-resource`,
      });

      const transferMethodAttributes = transferMethodResponse.data.data.attributes;

      await this.cardResourceEntityRepository.update(
        { uuid: resource_id },
        {
          transfer_method_id: cardAttributes['funds-transfer-method-id'],
          status: cardAttributes['status'],
          credit_card_bin: transferMethodAttributes['last-4'],
          credit_card_type: transferMethodAttributes['credit-card-type'],
          credit_card_expiration_date: transferMethodAttributes['credit-card-expiration-date'],
          credit_card_name: transferMethodAttributes['credit-card-name'],
        },
      );

      return { success: true };
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async getCreditCards(id: number): Promise<CreditCardsResponse> {
    const cards = await this.cardResourceEntityRepository
      .createQueryBuilder('c')
      .where('c.user_id = :id', { id })
      .select([
        'c.id as id',
        'c.uuid as uuid',
        'c.transfer_method_id as transfer_method_id',
        'c.credit_card_bin as credit_card_bin',
        'c.credit_card_name as credit_card_name',
        'c.credit_card_type as credit_card_type',
        'c.credit_card_expiration_date as credit_card_expiration_date',
        'c.created_at as created_at',
        'c.updated_at as updated_at',
        'c.status as status',
      ])
      .getRawMany();

    return { data: cards };
  }

  async makeContribution(request: MakeContributionRequest): Promise<ContributionResponse> {
    const { id, funds_transfer_method_id, amount, cvv } = request;
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .leftJoinAndSelect(PrimeTrustContactEntity, 'c', 'c.user_id = u.id')
      .select(['a.uuid as account_id,c.uuid as contact_id'])
      .where('a.user_id = :id', { id })
      .getRawOne();

    const { account_id, contact_id } = accountData;
    const formData = {
      data: {
        type: 'contributions',
        attributes: {
          amount,
          'contact-id': contact_id,
          'funds-transfer-method-id': funds_transfer_method_id,
          'account-id': account_id,
          'currency-type': 'USD',
        } as Record<string, any>,
      },
    };
    if (cvv) {
      formData.data.attributes['cvv'] = cvv;
    }

    try {
      const contributionResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/contributions?include=funds-transfer`,
        data: formData,
      });
      const contributionAttributes = contributionResponse.data.data.attributes;
      const contributionPayload: Record<string, any> = {
        type: 'deposit',
        user_id: id,
        uuid: contributionResponse.data.data.id,
        currency_type: contributionAttributes['currency-type'],
        amount: contributionAttributes['amount'],
        status: contributionAttributes['status'],
      };
      if (contributionAttributes['payment-type'] !== 'credit_card') {
        const depositParam = await this.depositParamsEntityRepository.findOne({
          where: { uuid: funds_transfer_method_id },
        });
        contributionPayload['param_type'] = 'deposit_param';
        contributionPayload['param_id'] = depositParam.id;
      } else {
        const cardResource = await this.cardResourceEntityRepository.findOne({
          where: { transfer_method_id: funds_transfer_method_id },
        });
        contributionPayload['param_type'] = 'credit_card';
        contributionPayload['param_id'] = cardResource.id;
      }
      await this.primeBalanceManager.updateAccountBalance(account_id);

      await this.depositEntityRepository.save(this.depositEntityRepository.create(contributionPayload));

      return { contribution_id: contributionResponse.data.data.id };
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async addDepositParams(request: DepositParamRequest): Promise<DepositResponse> {
    const { id, bank_account_id, funds_transfer_type } = request;
    await this.checkBankExists(id, bank_account_id);
    const contact = await this.primeTrustContactEntityRepository.findOneBy({ user_id: id });
    const transferMethod = await this.depositParamsEntityRepository.findOneBy({
      user_id: id,
      bank_account_id,
      funds_transfer_type,
    });
    let transferMethodId;
    if (!transferMethod) {
      transferMethodId = await this.createFundsTransferMethod(request, contact.uuid);
      await this.depositParamsEntityRepository.save(
        this.depositParamsEntityRepository.create({
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

  async checkBankExists(user_id: number, bank_id: number) {
    const banks = await this.primeBankAccountManager.getBankAccounts(user_id);
    const data = banks.data.filter((b) => b.id === bank_id);
    if (data.length === 0) {
      throw new GrpcException(Status.ABORTED, 'Bank account does`nt exist!', 400);
    }
  }

  async getDepositById(request: UserIdRequest): Promise<DepositDataResponse> {
    const { id, resource_id } = request;
    const deposit = await this.depositEntityRepository
      .createQueryBuilder('c')
      .select('*')
      .where('c.id = :resource_id AND c.user_id=:id AND type=:type', { resource_id, id, type: 'deposit' })
      .getRawOne();
    if (!deposit) {
      throw new GrpcException(Status.NOT_FOUND, 'Deposit not found!', 404);
    }

    return deposit;
  }

  async getDepositParams(id: number): Promise<DepositParamsResponse> {
    const params = await this.depositParamsEntityRepository
      .createQueryBuilder('d')
      .leftJoinAndSelect(BankAccountEntity, 'b', 'b.id = d.bank_account_id')
      .where('d.user_id = :id', { id })
      .select([
        'd.id as id',
        'd.uuid as transfer_method_id',
        'b.bank_account_number as bank_account_number',
        'b.routing_number as routing_number',
        'd.funds_transfer_type as funds_transfer_type',
        'b.bank_account_name as bank_account_name',
      ])
      .getRawMany();

    return { data: params };
  }
}
