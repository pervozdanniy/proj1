import { Status } from '@grpc/grpc-js/build/src/constants';
import { AxiosResponse } from 'axios';

type PrimeTrustError = {
  detail: string;
  title: string;
  code: number;
  source?: { pointer: string };
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
    const error = this.errors[0];
    if (error.detail === 'Initiator has insufficient funds') {
      this.code = Status.ALREADY_EXISTS;
    }

    return {
      detail: `${error.source?.pointer} ${error.detail}`,
      code: this.code,
    };
  }
}
