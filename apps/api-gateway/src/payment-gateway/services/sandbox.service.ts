import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { CardResourceDto } from '../dtos/deposit/card-resource.dto';
import { WebhookUrlDto } from '../dtos/sandbox/webhook-url.dto';

@Injectable()
export class SandboxService {
  constructor(private readonly httpService: HttpService, @InjectRedis() private readonly redis: Redis) {}

  async bind(payload: WebhookUrlDto) {
    const token = await this.redis.get('prime_token');
    const formData = {
      data: {
        type: 'webhook-configs',
        attributes: {
          url: `${payload.url}/webhook/prime_trust`,
          enabled: true,
        },
      },
    };

    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const webhooks = await lastValueFrom(
        this.httpService.get<{ data: Array<{ id: string; attributes: { url: string } }> }>(
          `https://sandbox.primetrust.com/v2/webhook-configs`,
          {
            headers: headersRequest,
          },
        ),
      );

      webhooks.data.data.map(async (w) => {
        if (w.attributes.url !== 'https://dev-api.skopadev.com/webhook/prime_trust') {
          await lastValueFrom(
            this.httpService.patch(`https://sandbox.primetrust.com/v2/webhook-configs/${w.id}`, formData, {
              headers: headersRequest,
            }),
          );
        }
      });

      return { success: true };
    } catch (e) {
      return e.response.data.errors;
    }
  }

  async getCardDescriptor(payload: CardResourceDto) {
    const token = await this.redis.get('prime_token');
    const { resource_id } = payload;

    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const cardResponse = await lastValueFrom(
        this.httpService.get(`https://sandbox.primetrust.com/v2/credit-card-resources/${resource_id}/sandbox`, {
          headers: headersRequest,
        }),
      );

      return cardResponse.data;
    } catch (e) {
      return e.response.data.errors;
    }
  }
}
