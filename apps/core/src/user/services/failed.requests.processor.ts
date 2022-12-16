import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { Status } from '@grpc/grpc-js/build/src/constants';

@Processor('prime_trust_failed')
@Injectable()
export class FailedRequestsProcessor {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(PrimeTrustUserEntity)
    private primeUserRepository: Repository<PrimeTrustUserEntity>,
  ) {}

  @Process('no_connection_jobs')
  async processFile(job: Job) {
    const user = job.data;
    await this.sendRequest(user);
  }

  async sendRequest(user) {
    const createData = {
      data: {
        type: 'user',
        attributes: {
          email: user.email,
          name: user.name,
          password: user.password,
        },
      },
    };
    await lastValueFrom(this.httpService.post('https://sandbox.primetrust.com/v2/users', createData))
      .then(async (response) => {
        await this.primeUserRepository.save({
          ...user,
          uuid: response.data.data.id,
          status: 'active',
          disabled: response.data.data.attributes.disabled,
        });
      })
      .catch(async (e) => {
        if (e.code == 'ENOTFOUND') {
          console.log('request@ sending .......');
          setTimeout(async () => {
            await this.sendRequest(user);
          }, 2000);
        } else {
          throw new GrpcException(Status.ABORTED, e.response.data, 400);
        }
      });
  }
}
