import { Status } from '@grpc/grpc-js/build/src/constants';
import { AxiosResponse } from 'axios';

type PrimeTrustError = {
  detail: string;
  title: string;
  code: number;
};

export class PrimeTrustException extends Error {
  readonly errors: PrimeTrustError[];
  public code: number;
  constructor(response: AxiosResponse) {
    super('Prime trust');
    this.code = Status.ABORTED;
    this.errors = response.data.errors;
  }

  getFirstError() {
    if (this.errors[0].detail === 'Initiator has insufficient funds') {
      this.code = Status.ALREADY_EXISTS;
    }

    return {
      detail: this.errors[0].detail,
      code: this.code,
    };
  }
}
