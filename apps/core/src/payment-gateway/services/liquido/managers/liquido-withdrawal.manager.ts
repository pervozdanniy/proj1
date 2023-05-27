import { UserService } from '@/user/services/user.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { TransferInfo, TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { countriesData } from '../../../country/data';
import { ParamsTypes, TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { KoyweMainManager } from '../../koywe/managers/koywe-main.manager';
import { PrimeWithdrawalManager } from '../../prime_trust/managers/prime-withdrawal.manager';
import { LiquidoTokenManager } from './liquido-token.manager';

@Injectable()
export class LiquidoWithdrawalManager {
  private readonly logger = new Logger(LiquidoWithdrawalManager.name);
  private readonly api_url: string;
  private readonly x_api_key: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: HttpService,
    private readonly koyweMainManager: KoyweMainManager,
    private readonly userService: UserService,

    private liquidoTokenManager: LiquidoTokenManager,

    private readonly primeWithdrawalManager: PrimeWithdrawalManager,
    @InjectRepository(TransfersEntity)
    private readonly transferRepository: Repository<TransfersEntity>,
  ) {
    const { x_api_key, api_url } = config.get('liquido', { infer: true });
    this.x_api_key = x_api_key;
    this.api_url = api_url;
  }

  @Cron('* * */2 * * *')
  async handleCron() {}

  async makeWithdrawal({
    amount,
    id: user_id,
    bank_account_id,
    funds_transfer_type,
  }: TransferMethodRequest): Promise<TransferInfo> {
    const userDetails = await this.userService.getUserInfo(user_id);
    const { currency_type } = countriesData[userDetails.country_code];
    const { token } = await this.liquidoTokenManager.getToken();
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-api-key': this.x_api_key,
    };
    const { transfer_method_id: funds_transfer_method_id } =
      await this.primeWithdrawalManager.addWithdrawalParamsOtherCountries({
        id: user_id,
        bank_account_id,
        funds_transfer_type,
      });
    const withdrawalParams = await this.primeWithdrawalManager.getWithdrawalParamByUuid(funds_transfer_method_id);
    const { amountOut } = await this.koyweMainManager.getCurrencyAmountByUsd(amount, currency_type);
    const bank = await this.primeWithdrawalManager.getBankByWithdrawalParamId(withdrawalParams.id);

    const idempotencyKey = await uid(18);
    const formData = {
      idempotencyKey,
      country: userDetails.country_code,
      targetName: userDetails.details.first_name,
      targetLastName: userDetails.details.last_name,
      targetEmail: userDetails.email,
      targetBankAccountId: bank.bank_account_number,
      amountInCents: amountOut,
      currency: currency_type,
      comment: 'Liquido CompanyName',
    };

    const response = await lastValueFrom(
      this.httpService.post(`${this.api_url}/v1/payments/payouts/spei`, formData, { headers: headersRequest }),
    );
    this.logger.log(response.data);

    await this.transferRepository.save(
      this.transferRepository.create({
        uuid: idempotencyKey,
        amount: amountOut,
        user_id,
        type: TransferTypes.WITHDRAWAL,
        param_type: ParamsTypes.WITHDRAWAL,
        param_id: withdrawalParams.id,
        amount_usd: amount,
        currency_type,
        provider: Providers.LIQUIDO,
        status: TransferStatus.PENDING,
      }),
    );

    return { amount, currency: 'USD', fee: 0 };
  }
}
