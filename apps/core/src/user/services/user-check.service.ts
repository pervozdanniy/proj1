import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import process from 'process';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class UserCheckService {
  private readonly api_key: string;
  constructor(private readonly httpService: HttpService, private config: ConfigService<ConfigInterface>) {
    const { api_key } = config.get('ipqualityscore');
    this.api_key = api_key;
  }

  async checkUserData(phone: string, email: string) {
    if (process.env.NODE_ENV !== 'dev') {
      const emailResponse = await lastValueFrom(
        this.httpService.get(`https://ipqualityscore.com/api/json/email/${this.api_key}/${email}`),
      );
      if (!emailResponse.data.valid) {
        throw new GrpcException(Status.ABORTED, 'Invalid email', 400);
      }

      const phoneResponse = await lastValueFrom(
        this.httpService.get(`https://ipqualityscore.com/api/json/phone/${this.api_key}/${phone}`),
      );
      if (!phoneResponse.data.valid) {
        throw new GrpcException(Status.ABORTED, 'Invalid phone number', 400);
      }
    }
  }
}
