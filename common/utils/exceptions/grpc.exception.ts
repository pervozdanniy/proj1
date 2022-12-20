import { status } from '@grpc/grpc-js';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

const map: Partial<Record<HttpStatus, status>> = {
  [HttpStatus.BAD_REQUEST]: status.INVALID_ARGUMENT,
  [HttpStatus.UNAUTHORIZED]: status.UNAUTHENTICATED,
  [HttpStatus.FORBIDDEN]: status.PERMISSION_DENIED,
  [HttpStatus.NOT_FOUND]: status.NOT_FOUND,
  [HttpStatus.CONFLICT]: status.ALREADY_EXISTS,
  [HttpStatus.UNPROCESSABLE_ENTITY]: status.INVALID_ARGUMENT,
  [HttpStatus.INTERNAL_SERVER_ERROR]: status.INTERNAL,
};

export class GrpcException extends RpcException {
  static fromHttp(exception: HttpException) {
    const resp = exception.getResponse();

    return new GrpcException(
      map[exception.getStatus()],
      exception.message,
      exception.getStatus(),
      typeof resp === 'object' ? resp : undefined,
    );
  }
  constructor(code: status, message: string, error_code?: number, additional_data?: any) {
    super({ message, code, error_code, additional_data });
  }
}
