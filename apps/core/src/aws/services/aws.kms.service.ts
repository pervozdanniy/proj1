import { Injectable } from '@nestjs/common';
import { KMS } from 'aws-sdk';
import * as process from 'process';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class AwsKmsService {
  private kms: KMS;
  private kms_key = process.env.KMS_KEY;

  constructor(aws: ConfigInterface['aws']) {
    this.kms = new KMS(aws);
  }

  async encrypt(buffer) {
    return new Promise((resolve, reject) => {
      const params = {
        KeyId: this.kms_key,
        Plaintext: buffer,
      };
      this.kms.encrypt(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.CiphertextBlob);
        }
      });
    });
  }

  async decrypt(buffer) {
    return new Promise((resolve, reject) => {
      const params = {
        CiphertextBlob: buffer,
      };
      this.kms.decrypt(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Plaintext);
        }
      });
    });
  }
}
