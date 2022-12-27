import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { DepositFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/deposit-funds.dto';
import { SettleFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/settle-funds.dto';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly httpService: HttpService) {}

  async handler(payload, client: PaymentGatewayServiceClient) {
    const { resource_type, action } = payload;
    const id: string = payload['account-id'];
    if (resource_type === 'accounts' && action === 'update') {
      return lastValueFrom(client.updateAccount({ id, status: 'opened', payment_gateway: 'prime_trust' }));
    } else if (resource_type === 'kyc_document_checks' && action === 'update') {
      return lastValueFrom(client.documentCheck({ id, payment_gateway: 'prime_trust' }));
    } else if (resource_type === 'funds_transfers' && action === 'update') {
      return lastValueFrom(client.updateBalance({ id, payment_gateway: 'prime_trust' }));
    }
  }

  async depositFunds(payload: DepositFundsDto) {
    const { token, transfer_reference_id, data } = payload;
    const formData = {
      data: {
        type: 'contributions',
        attributes: {
          amount: data.amount,
          'currency-type': data.currency_type,
          'funds-transfer-type': data.funds_transfer_type,
        },
      },
    };
    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const transferRefResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/contact-funds-transfer-references/${transfer_reference_id}/sandbox/contribution`,
          formData,
          {
            headers: headersRequest,
          },
        ),
      );

      return transferRefResponse.data;
    } catch (e) {
      console.log(e.response.data);

      throw new Error(e.response.data);
    }
  }

  async settleFunds(payload: SettleFundsDto) {
    const { token, contribution_id } = payload;

    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/contributions/${contribution_id}/sandbox/authorize`,
          null,
          {
            headers: headersRequest,
          },
        ),
      );

      const contributionResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/contributions/${contribution_id}/sandbox/settle`,
          null,
          {
            headers: headersRequest,
          },
        ),
      );

      return contributionResponse.data;
    } catch (e) {
      console.log(e.response.data.errors);

      throw new Error(e.response.data);
    }
  }
}
