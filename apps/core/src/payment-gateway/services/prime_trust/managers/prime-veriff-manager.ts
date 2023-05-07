import { NotificationService } from '@/notification/services/notification.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  SocureDocumentRequest,
  VeriffHookRequest,
  VeriffSessionRequest,
  VeriffSessionResponse,
} from '~common/grpc/interfaces/payment-gateway';
import { UserService } from '../../../../user/services/user.service';
import { SocureDocumentEntity } from '../../../entities/socure-document.entity';

@Injectable()
export class PrimeVeriffManager {
  private readonly logger = new Logger(PrimeVeriffManager.name);
  private readonly url: string;
  private readonly api_key: string;
  private readonly secret;
  constructor(
    private userService: UserService,
    private readonly httpService: HttpService,
    private readonly notificationService: NotificationService,

    config: ConfigService<ConfigInterface>,
    @InjectRepository(SocureDocumentEntity)
    private readonly primeTrustSocureDocumentEntityRepository: Repository<SocureDocumentEntity>,
  ) {
    const { veriff_url } = config.get('app', { infer: true });
    const { api_key, secret } = config.get('veriff', { infer: true });
    this.url = veriff_url;
    this.api_key = api_key;
    this.secret = secret;
  }

  createHash(payload: string): string {
    const sharedSecretKey = this.secret;

    const hmac = createHmac('sha256', sharedSecretKey);
    hmac.update(payload);

    const xHmacSignature = hmac.digest('hex');

    return xHmacSignature;
  }

  async createSocureDocument(request: SocureDocumentRequest): Promise<SuccessResponse> {
    const { user_id } = request;
    let status = false;
    try {
      await this.primeTrustSocureDocumentEntityRepository.save(
        this.primeTrustSocureDocumentEntityRepository.create(request),
      );
      status = true;
      await this.notificationService.sendWs(user_id, 'socure', 'Document successfully uploaded!', 'Socure document');
    } catch (e) {
      this.logger.log(e.message);
    }

    return { success: status };
  }

  async generateVeriffLink({ user_id, type }: VeriffSessionRequest): Promise<VeriffSessionResponse> {
    const user = await this.userService.getUserInfo(user_id);
    try {
      const headersRequest = {
        'X-AUTH-CLIENT': this.api_key,
      };

      const formData = {
        verification: {
          callback: 'https://veriff.me',
          person: {
            firstName: user.details.first_name,
            lastName: user.details.last_name,
            dateOfBirth: user.details.date_of_birth,
          },
          document: {
            type,
            country: user.country_code,
          },
          vendorData: 'Postman test',
        },
      };

      const sessionResponse = await lastValueFrom(
        this.httpService.post(`${this.url}/v1/sessions/`, formData, {
          headers: headersRequest,
        }),
      );

      return sessionResponse.data;
    } catch (e) {
      this.logger.log(e.message);
    }
  }
  async veriffHookHandler({ attemptId }: VeriffHookRequest): Promise<SuccessResponse> {
    const hash = this.createHash(attemptId);
    const headersRequest = {
      'Content-Type': 'application/json',
      'X-HMAC-SIGNATURE': hash,
      'X-AUTH-CLIENT': this.api_key,
    };

    const response = await lastValueFrom(
      this.httpService.get(`${this.url}/v1/attempts/${attemptId}/media`, {
        headers: headersRequest,
      }),
    );
    response.data.images.forEach((i: { id: string; url: string }) => {
      console.log(this.createHash(i.id));
      console.log(i.url);
    });

    return { success: true };
  }
}
