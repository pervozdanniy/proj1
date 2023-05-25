import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { LiquidoWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import {TransfersEntity, TransferStatus} from '../../../entities/transfers.entity';
import { KoyweService } from '../../koywe/koywe.service';
import { LiquidoTokenManager } from './liquido-token.manager';

@Injectable()
export class LiquidoWebhookManager {
  private readonly logger = new Logger(LiquidoWebhookManager.name);
  private readonly api_url: string;
  private readonly x_api_key: string;
  private readonly skopaKoyweWallet: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly liquidoTokenManager: LiquidoTokenManager,

    private koyweService: KoyweService,
    private userService: UserService,
    private readonly httpService: HttpService,

    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
  ) {
    const { api_url, x_api_key } = config.get('liquido', { infer: true });
    const { skopaKoyweWallet } = config.get('prime_trust', { infer: true });
    this.api_url = api_url;
    this.x_api_key = x_api_key;
    this.skopaKoyweWallet = skopaKoyweWallet;
  }

  async liquidoWebhooksHandler({
    amount,
    currency,
    country,
    paymentStatus,
    email,
    orderId,
  }: LiquidoWebhookRequest): Promise<SuccessResponse> {
    const { token } = await this.liquidoTokenManager.getToken();
    const user = await this.userService.findByLogin({ email });
    const userDetails = await this.userService.getUserInfo(user.id);

    try {
      if (paymentStatus === 'SETTLED') {
        await this.depositEntityRepository.update({ uuid: orderId }, { status: TransferStatus.SETTLED });
        let accountNumber;
        if (country === 'MX') {
          const transfer = await this.depositEntityRepository.findOneBy({ uuid: orderId });
          const request = {
            id: user.id,
            amount: transfer.amount,
            currency_type: transfer.currency_type,
            type: 'wire',
          };
          //   const { wallet_address, asset_transfer_method_id } = await this.primeTrustService.createWallet(request);

          const { bank } = await this.koyweService.createReference(request, {
            wallet_address: this.skopaKoyweWallet, //we use wallet from Skopa,for cash payments (All payments goes to this wallet)
            method: 'WIREMX',
          });
          const lines = bank.account_number.split('\n');

          accountNumber = lines[1];
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

      throw new GrpcException(Status.ABORTED, 'Liquido payment exception!', 400);
    }
  }
}
