import { UserService } from '@/user/services/user.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { LiquidoDepositWebhookRequest, LiquidoWithdrawalWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import {
  LiquidoAuthorizationStatus,
  LiquidoWithdrawAuthorizationEntity,
} from '../../../entities/liquido_withdraw_authorization.entity';
import { TransfersEntity, TransferStatus } from '../../../entities/transfers.entity';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../koywe/koywe.service';
import { PrimeAccountManager } from '../../prime_trust/managers/prime-account.manager';
import { PrimeFundsTransferManager } from '../../prime_trust/managers/prime-funds-transfer.manager';
import { LiquidoTokenManager } from './liquido-token.manager';

@Injectable()
export class LiquidoWebhookManager {
  private readonly logger = new Logger(LiquidoWebhookManager.name);
  private readonly api_url: string;
  private readonly x_api_key: string;
  private readonly skopaKoyweWallet: string;
  private readonly skopaKoyweAccountId: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly liquidoTokenManager: LiquidoTokenManager,

    private koyweService: KoyweService,
    private userService: UserService,
    private readonly httpService: HttpService,
    private readonly primeAccountManager: PrimeAccountManager,
    private readonly primeFundsTransferManager: PrimeFundsTransferManager,

    @InjectRepository(TransfersEntity)
    private readonly transfersEntityRepository: Repository<TransfersEntity>,

    @InjectRepository(LiquidoWithdrawAuthorizationEntity)
    private readonly liquidoAuthRepo: Repository<LiquidoWithdrawAuthorizationEntity>,
  ) {
    const { api_url, x_api_key } = config.get('liquido', { infer: true });
    const { skopaKoyweWallet, skopaKoyweAccountId } = config.get('prime_trust', { infer: true });
    this.api_url = api_url;
    this.x_api_key = x_api_key;
    this.skopaKoyweWallet = skopaKoyweWallet; //Skopa wallet in our Prime Trust
    this.skopaKoyweAccountId = skopaKoyweAccountId;
  }

  async liquidoDepositHandler({
    amount,
    currency,
    country,
    paymentStatus,
    email,
    orderId,
  }: LiquidoDepositWebhookRequest): Promise<SuccessResponse> {
    const { token } = await this.liquidoTokenManager.getToken();
    const user = await this.userService.findByLogin({ email });
    const userDetails = await this.userService.getUserInfo(user.id);

    try {
      if (paymentStatus === 'SETTLED') {
        await this.transfersEntityRepository.update({ uuid: orderId }, { status: TransferStatus.SETTLED });
        let accountNumber;
        const transfer = await this.transfersEntityRepository.findOneBy({ uuid: orderId });
        const request: CreateReferenceRequest = {
          user_id: user.id,
          amount_usd: transfer.amount_usd,
          currency_type: transfer.currency_type,
        };
        if (country === 'MX') {
          const { bank } = await this.koyweService.createReference(request, {
            wallet_address: this.skopaKoyweWallet, //we use wallet from Skopa,for cash payments (All payments goes to this wallet)
            method: 'WIREMX',
          });
          const lines = bank.account_number.split('\n');

          accountNumber = lines[1];
        }
        if (country === 'CO') {
          const { bank } = await this.koyweService.createReference(request, {
            wallet_address: this.skopaKoyweWallet,
            method: 'WIRECO',
          });
          const lines = bank.account_number.split('\n');

          accountNumber = lines[3];
        }

        if (country === 'CL') {
          const { bank } = await this.koyweService.createReference(request, {
            wallet_address: this.skopaKoyweWallet,
            method: 'WIRECL',
          });
          const lines = bank.account_number.split('\n');
          accountNumber = lines[1].match(/\d+/)[0];
        }

        const headersRequest = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-api-key': this.x_api_key,
        };

        const formData = {
          idempotencyKey: await uid(18),
          country,
          targetName: userDetails.details.first_name,
          targetBankAccountId: accountNumber,
          amountInCents: amount,
          currency: currency,
          comment: 'Liquido CompanyName',
        };

        await lastValueFrom(
          this.httpService.post(`${this.api_url}/v1/payments/payouts/spei`, formData, { headers: headersRequest }),
        );
      }

      return { success: true };
    } catch (e) {
      this.logger.log(e);

      throw new ConflictException('Liquido payout exception!');
    }
  }

  async liquidoWithdrawHandler({
    transferStatus,
    idempotencyKey,
  }: LiquidoWithdrawalWebhookRequest): Promise<SuccessResponse> {
    const withdrawal = await this.transfersEntityRepository.findOneBy({ uuid: idempotencyKey });
    let withdrawalStatus = TransferStatus.PENDING;
    if (transferStatus === 'SETTLED') {
      withdrawalStatus = TransferStatus.SETTLED;
    }
    if (transferStatus === 'FAILED' || transferStatus === 'REJECTED') {
      withdrawalStatus = TransferStatus.FAILED;

      const userAccount = await this.primeAccountManager.getAccount(withdrawal.user_id);
      await this.primeFundsTransferManager.sendFunds(
        this.skopaKoyweAccountId,
        userAccount.uuid,
        withdrawal.amount_usd,
        false,
      ); //return funds to user
    }
    await this.transfersEntityRepository.update({ uuid: idempotencyKey }, { status: withdrawalStatus });
    const currentWithdrawAuth = await this.liquidoAuthRepo.findOneBy({ transfer_id: withdrawal.id });
    if (!currentWithdrawAuth) {
      await this.liquidoAuthRepo.save(
        this.liquidoAuthRepo.create({
          transfer_id: withdrawal.id,
          amount_usd: withdrawal.amount_usd,
          amount: withdrawal.amount,
          currency: withdrawal.currency_type,
          status: LiquidoAuthorizationStatus.Pending,
        }),
      );
    }

    return { success: true };
  }
}
