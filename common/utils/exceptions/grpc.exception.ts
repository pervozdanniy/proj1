import { Metadata, status } from '@grpc/grpc-js';
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

const reverseMap: Partial<Record<status, HttpStatus>> = {
  [status.OK]: HttpStatus.OK,
  [status.CANCELLED]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [status.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
};

export const isGrpcException = (exception: Error): exception is GrpcException => {
  return (exception as GrpcException)?.metadata instanceof Metadata;
};

export class GrpcException extends RpcException {
  static fromHttp(exception: HttpException) {
    return new GrpcException(map[exception.getStatus()], exception.message);
  }

  static toHttp(exception: GrpcException): HttpException {
    return new HttpException(exception.details, reverseMap[exception.code], { cause: exception });
  }

  readonly code: status;

  readonly details: string;

  readonly metadata?: Metadata;

  constructor(code: status, message: string, error_code?: number, metadata?: Metadata) {
    super({ message, code, error_code });
    this.code = code;
    this.details = message;
    this.metadata = metadata;
  }
}
