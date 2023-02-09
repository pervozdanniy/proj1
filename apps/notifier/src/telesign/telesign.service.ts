import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { stringify } from 'qs';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TelesignService {
  constructor(private readonly http: HttpService) {}
  async send(phone, body) {
    const data = stringify({
      phone_number: phone,
      message: body,
      message_type: 'ARN',
    });
    try {
      await lastValueFrom(this.http.post('https://rest-api.telesign.com/v1/messaging', data));
    } catch (e) {
      console.log(e.response.data);
    }
  }
}
