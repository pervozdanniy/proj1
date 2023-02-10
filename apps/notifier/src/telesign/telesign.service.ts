import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { stringify } from 'qs';
import { lastValueFrom } from 'rxjs';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class TelesignService {
  constructor(private readonly http: HttpService) {}
  async send(phone, body) {
    const number = phone.replace('+', '');
    const data = stringify({
      phone_number: number,
      message: body,
      message_type: 'ARN',
    });
    try {
      await lastValueFrom(this.http.post('https://rest-api.telesign.com/v1/messaging', data));
    } catch (e) {
      throw new GrpcException(Status.ABORTED, 'Message provider error', 500);
    }
  }
}
