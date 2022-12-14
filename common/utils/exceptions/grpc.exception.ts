import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class GrpcException extends RpcException {
  constructor(code: status, message: string, error_code?: number, additional_data?: Record<string, unknown>) {
    super({ message, code, error_code, additional_data });
  }
}
