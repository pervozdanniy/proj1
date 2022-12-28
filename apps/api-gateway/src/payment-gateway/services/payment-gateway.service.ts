import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountIdRequest,
  PaymentGatewayServiceClient,
  TokenSendRequest,
  UploadDocumentRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { DepositFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/deposit-funds.dto';
import { SettleFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/settle-funds.dto';

@Injectable()
export class PaymentGatewayService implements OnModuleInit {
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  constructor(
    @InjectGrpc('core') private readonly client: ClientGrpc,

    private readonly httpService: HttpService,
  ) {}
  onModuleInit() {
    this.paymentGatewayServiceClient = this.client.getService('PaymentGatewayService');
  }

  updateAccount(data) {
    const formData = { ...data, status: 'opened' };

    return lastValueFrom(this.paymentGatewayServiceClient.updateAccount(formData));
  }

  documentCheck(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.documentCheck(data));
  }

  updateBalance(data: AccountIdRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.updateBalance(data));
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
      throw new Error(e.response.data);
    }
  }

  getToken(id: number) {
    return lastValueFrom(this.paymentGatewayServiceClient.getToken({ id }));
  }

  createAccount(data: TokenSendRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.createAccount(data));
  }

  createContact(data: TokenSendRequest): Promise<SuccessResponse> {
    return lastValueFrom(this.paymentGatewayServiceClient.createContact(data));
  }

  uploadDocument(data: UploadDocumentRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.uploadDocument(data));
  }

  getBalance(data: TokenSendRequest) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBalance(data));
  }

  async createReference(data: TokenSendRequest) {
    const response = await lastValueFrom(this.paymentGatewayServiceClient.createReference(data));

    return { data: JSON.parse(response.data) };
  }
}
