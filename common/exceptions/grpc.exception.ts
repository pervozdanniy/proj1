import { Metadata } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class GRPCException extends RpcException {
  constructor(
    code: number,
    message: string,
    error_code: number,
    additional_data?: Record<string, unknown>,
  ) {
    const metadata = new Metadata();
    const details = {
      message,
      error_code,
      ...additional_data,
    };
    metadata.set('details', JSON.stringify(details));
    super({ message, code, metadata });
  }
}
