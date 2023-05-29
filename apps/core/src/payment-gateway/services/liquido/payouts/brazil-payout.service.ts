import { UserService } from '@/user/services/user.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { TransferInfo, TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { countriesData, liquidoPayoutTypes } from '../../../country/data';
import { ParamsTypes, TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { FacilitaMainManager } from '../../facilita/managers/facilita-main.manager';
import { PrimeWithdrawalManager } from '../../prime_trust/managers/prime-withdrawal.manager';
import { LiquidoTokenManager } from '../managers/liquido-token.manager';

@Injectable()
export class BrazilPayoutService {
  private readonly api_url: string;
  private readonly x_api_key: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly facilitaMainManager: FacilitaMainManager,
    private liquidoTokenManager: LiquidoTokenManager,
    private readonly primeWithdrawalManager: PrimeWithdrawalManager,
    @InjectRepository(TransfersEntity)
    private readonly transferRepository: Repository<TransfersEntity>,
  ) {
    const { x_api_key, api_url } = config.get('liquido', { infer: true });
    this.x_api_key = x_api_key;
    this.api_url = api_url;
  }

  async makePayout({
    amount,
    id: user_id,
    bank_account_id,
    funds_transfer_type,
  }: TransferMethodRequest): Promise<TransferInfo> {
    const userDetails = await this.userService.getUserInfo(user_id);
    const document = userDetails.documents?.find((d) => d.status === 'approved');
    if (!document?.person_id_number) {
      throw new ConflictException('KYC is not completed');
    }
    const { currency_type } = countriesData[userDetails.country_code];
    const { type: payoutType } = liquidoPayoutTypes[userDetails.country_code];
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
    const { usdbrl: pureRate } = await this.facilitaMainManager.countBrazilRate();
    const amountOut = pureRate * amount;
    const bank = await this.primeWithdrawalManager.getBankByWithdrawalParamId(withdrawalParams.id);
    const idempotencyKey = await uid(18);
    const formData = {
      idempotencyKey,
      country: userDetails.country_code,
      targetName: userDetails.details.first_name,
      targetLastName: userDetails.details.last_name,
      targetDocument: document.person_id_number,
      targetEmail: userDetails.email,
      targetBankCode: bank.bank_code,
      targetBankAgency: bank.bank_agency_code,
      targetBankAccountId: bank.bank_account_number,
      amountInCents: amountOut,
      currency: currency_type,
      comment: 'Brazil payout',
    };

    let payoutStatus = TransferStatus.FAILED;
    const payoutResponse = await lastValueFrom(
      this.httpService.post(`${this.api_url}/v1/payments/payouts/${payoutType}`, formData, {
        headers: headersRequest,
      }),
    );

    if (payoutResponse.data.transferStatus === 'IN_PROGRESS') {
      payoutStatus = TransferStatus.PENDING;
    }

    if (payoutResponse.data.transferStatus === 'SETTLED') {
      payoutStatus = TransferStatus.SETTLED;
    }
    if (payoutResponse.data.statusCode !== 200) {
      throw new ConflictException(payoutResponse.data.errorMsg);
    }

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
        status: payoutStatus,
      }),
    );

    return { amount, currency: 'USD', fee: 0 };
  }
}
