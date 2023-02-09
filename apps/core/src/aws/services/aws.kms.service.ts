import { Injectable } from '@nestjs/common';
import { KMS } from 'aws-sdk';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class AwsKmsService {
  private kms: KMS;
  private readonly kms_key: string;

  constructor(aws: ConfigInterface['aws'], kms: ConfigInterface['kms']) {
    this.kms_key = kms['key'];
    this.kms = new KMS(aws);
  }

  encrypt(buffer: Uint8Array): Promise<KMS.CiphertextType> {
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

  decrypt(buffer: Uint8Array): Promise<KMS.PlaintextType> {
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
