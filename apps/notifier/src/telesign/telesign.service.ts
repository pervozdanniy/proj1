import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { stringify } from 'qs';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TelesignService {
  constructor(private readonly http: HttpService) {}
  async send(phone: string, body: string) {
    const number = phone.replace('+', '');
    const data = stringify({
      phone_number: number,
      message: body,
      message_type: 'ARN',
    });

    return lastValueFrom(this.http.post('https://rest-api.telesign.com/v1/messaging', data));
  }
}
