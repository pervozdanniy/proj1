import {
  CreateBucketCommand,
  HeadBucketCommand,
  HeadBucketRequest,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

export type UploadedFile = Express.Multer.File;

@Injectable()
export class S3Service {
  #created = false;

  constructor(private readonly s3: S3Client, private readonly bucket: string) {}

  private async ensureBucket() {
    if (this.#created) {
      return;
    }

    const params: HeadBucketRequest = { Bucket: this.bucket };

    return this.s3
      .send(new HeadBucketCommand(params))
      .catch(() => this.s3.send(new CreateBucketCommand(params)))
      .then(() => (this.#created = true));
  }

  private buildKey(key: string) {
    return `uploads/user/${key}`;
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
}
