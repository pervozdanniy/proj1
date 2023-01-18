import { ArgumentsHost, Catch, HttpServer } from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { GrpcException, isGrpcException } from '../exceptions/grpc.exception';

@Catch()
export class ApiExceptionFilter extends BaseExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost) {
    let wrappedEx = exception;
    if (isGrpcException(exception)) {
      wrappedEx = GrpcException.toHttp(exception);
    }

    return super.catch(wrappedEx, host);
  }

  handleUnknownError(
    exception: Error,
    host: ArgumentsHost,
    applicationRef: HttpServer<any, any> | AbstractHttpAdapter<any, any, any>,
  ): void {
    Sentry.captureException(exception);

    return super.handleUnknownError(exception, host, applicationRef);
  }
}
