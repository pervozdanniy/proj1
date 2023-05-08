import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  VeriffHookRequest,
  VeriffSessionRequest,
  VeriffSessionResponse,
  WebhookResponse,
} from '~common/grpc/interfaces/veriff';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { UserService } from '../../../../user/services/user.service';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
import { Media } from '../../../types/prime-trust';

@Injectable()
export class PrimeVeriffManager {
  private readonly url: string;
  private readonly api_key: string;
  private readonly secret;

  constructor(
    private userService: UserService,
    private readonly httpService: HttpService,

    config: ConfigService<ConfigInterface>,
    @InjectRepository(VeriffDocumentEntity)
    private readonly veriffDocumentEntityRepository: Repository<VeriffDocumentEntity>,
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

  async generateVeriffLink({ user_id, type }: VeriffSessionRequest): Promise<VeriffSessionResponse> {
    const session = await this.createVeriffSession({ user_id, type });
    await this.veriffDocumentEntityRepository.save(
      this.veriffDocumentEntityRepository.create({
        user_id,
        session_id: session.verification.id,
        status: session.verification.status,
      }),
    );

    return session;
  }

  async getMedia(user_id: number): Promise<Media[]> {
    const session = await this.veriffDocumentEntityRepository.findOneBy({ user_id, status: 'approved' });
    if (session) {
      const attemptId = session.attempt_id;
      try {
        const headersRequest = {
          'Content-Type': 'application/json',
          'X-HMAC-SIGNATURE': this.createHash(attemptId),
          'X-AUTH-CLIENT': this.api_key,
        };

        const mediaResponse = await lastValueFrom(
          this.httpService.get(`${this.url}/v1/attempts/${attemptId}/media`, {
            headers: headersRequest,
          }),
        );

        const mediaUrls = await Promise.all(
          mediaResponse.data.images.map(async (i: Media) => {
            if (!i.name.includes('pre')) {
              return {
                id: i.id,
                label: session.label.toLowerCase(),
                name: i.name,
                session_id: i.sessionId,
                buffer: await this.getBuffer(i.id),
              };
            } else {
              return null;
            }
          }),
        );

        const filteredMediaUrls = mediaUrls.filter((i: Media | null) => i !== null);

        return filteredMediaUrls;
      } catch (e) {
        throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
      }
    }
  }

  async getBuffer(mediaId: string) {
    try {
      const headersRequest = {
        'Content-Type': 'application/json',
        'X-HMAC-SIGNATURE': this.createHash(mediaId),
        'X-AUTH-CLIENT': this.api_key,
      };

      const mediaResponse = await lastValueFrom(
        this.httpService.get(`${this.url}/v1/media/${mediaId}`, {
          headers: headersRequest,
          responseType: 'arraybuffer',
        }),
      );

      return mediaResponse.data;
    } catch (e) {
      console.log(e.message);
    }
  }

  async createVeriffSession({ user_id, type }: VeriffSessionRequest): Promise<VeriffSessionResponse> {
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

      const response = {
        status: sessionResponse.data.status,
        verification: {
          id: sessionResponse.data.verification.id,
          url: sessionResponse.data.verification.url,
          vendorData: sessionResponse.data.verification.vendorData,
          host: sessionResponse.data.verification.host,
          status: sessionResponse.data.verification.status,
          sessionToken: sessionResponse.data.verification.sessionToken,
        },
      };

      return response;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
  async veriffHookHandler({ attemptId: attempt_id, id: session_id }: VeriffHookRequest): Promise<SuccessResponse> {
    await this.veriffDocumentEntityRepository.update({ session_id }, { attempt_id });

    return { success: true };
  }

  async veriffWebhookHandler({
    verification: { id: session_id, status, document },
  }: WebhookResponse): Promise<{ success: boolean; user_id: number }> {
    const session = await this.veriffDocumentEntityRepository.findOneBy({ session_id });
    if (status === 'approved') {
      await this.veriffDocumentEntityRepository.update(
        { session_id },
        {
          document_number: document.number,
          issuing_date: document.validFrom,
          expiration_date: document.validUntil,
          label: document.type,
          status,
        },
      );

      return { success: true, user_id: session.user_id };
    } else {
      return { success: false, user_id: session.user_id };
    }
  }
}
