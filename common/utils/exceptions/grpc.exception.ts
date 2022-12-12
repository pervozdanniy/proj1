import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class GrpcException extends RpcException {
  constructor(code: status, message: string, error_code?: number, additional_data?: Record<string, unknown>) {
    const details = {
      message,
      error_code,
      ...additional_data,
    };
    super({ message, code, details });
  }
}
