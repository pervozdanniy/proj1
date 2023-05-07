import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadBucketRequest,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigInterface } from '~common/config/configuration';

export type UploadedFile = Express.Multer.File;

@Injectable()
export class S3Service {
  #created = false;

  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly s3: S3Client;

  constructor(config: ConfigInterface['aws']) {
    const { region, credentials, s3 } = config;
    this.s3 = new S3Client({ region, credentials, endpoint: s3.url, forcePathStyle: true });
    this.bucket = config.s3.bucket;
    this.baseUrl = config.s3.publicUrl;
  }

  private async ensureBucket() {
    if (this.#created) {
      return;
    }

    const params: HeadBucketRequest = { Bucket: this.bucket };

    const createBucket = async () => {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AddPerm',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      await this.s3.send(new PutBucketPolicyCommand({ Bucket: this.bucket, Policy: JSON.stringify(policy) }));
    };

    return this.s3
      .send(new HeadBucketCommand(params))
      .catch(() => createBucket())
      .then(() => (this.#created = true));
  }

  private buildKey(key: string) {
    return `uploads/${key}`;
  }

  async upload(key: string, file: UploadedFile) {
    await this.ensureBucket();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.buildKey(key),
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    return this.s3.send(command);
  }

  getUrl(key: string) {
    return `${this.baseUrl}/${this.bucket}/${this.buildKey(key)}`;
  }

  async delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return this.s3.send(command);
  }
}
