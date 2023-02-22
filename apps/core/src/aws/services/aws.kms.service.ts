import { DecryptCommandOutput, EncryptCommandOutput, KMS } from '@aws-sdk/client-kms';
import { Injectable } from '@nestjs/common';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class AwsKmsService {
  private kms: KMS;
  private readonly kms_key: string;

  constructor(config: ConfigInterface['aws']) {
    this.kms_key = config.kms.key;
    this.kms = new KMS({
      region: config.region,
      credentials: config.credentials,
    });
  }

  encrypt(buffer: Uint8Array): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const params = {
        KeyId: this.kms_key,
        Plaintext: buffer,
      };
      this.kms.encrypt(params, (err: any, data: EncryptCommandOutput) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.CiphertextBlob);
        }
      });
    });
  }

  decrypt(buffer: Uint8Array): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const params = {
        CiphertextBlob: buffer,
      };
      this.kms.decrypt(params, (err: any, data: DecryptCommandOutput) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Plaintext);
        }
      });
    });
  }
}
