import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { URLSearchParams } from 'node:url';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SlickTextService {
  private textwordId: number;

  constructor(private readonly http: HttpService) {}

  async getTextwordId() {
    if (this.textwordId === undefined) {
      const { data } = await lastValueFrom(this.http.get('https://api.slicktext.com/v1/textwords?limit=30&offset=0'));
      if (data.textwords[0]?.id) {
        this.textwordId = data.textwords[0].id;
      } else {
        throw new Error('SlickText: No textword initialized');
      }
    }

    return this.textwordId;
  }

  async send(phone: string, body: string) {
    const contactId = await this.add(phone);
    const params = new URLSearchParams();
    params.append('action', 'SEND');
    params.append('contact', contactId.toString());
    params.append('body', body);
    await lastValueFrom(this.http.post('https://api.slicktext.com/v1/messages/', params));
  }

  async add(phone: string): Promise<number> {
    const textwordId = await this.getTextwordId();
    const params = new URLSearchParams();
    params.append('action', 'OPTIN');
    params.append('textword', textwordId.toString());
    params.append('number', phone);
    try {
      const { data } = await lastValueFrom(this.http.post('https://api.slicktext.com/v1/contacts/', params));

      return data.contact.id;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === HttpStatus.CONFLICT) {
        return error.response.data.data.id;
      }

      throw error;
    }
  }
}
