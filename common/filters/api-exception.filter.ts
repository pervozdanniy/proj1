import { Catch, ArgumentsHost, HttpStatus, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Metadata, status } from '@grpc/grpc-js';
import * as Sentry from '@sentry/node';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter<Error> {
  catch(exception: Error & { metadata: Metadata; code: number; details: string }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let extras: Record<string, unknown> = {};

    if (exception.details && exception.metadata && exception.code) {
      const metadata = exception.metadata?.get('details')[0] as string;

      message = exception.details;
      if (metadata) {
        extras = JSON.parse(metadata);
      }

      if (extras.error_code) statusCode = extras.error_code as number;
      else {
        switch (exception.code) {
          case status.NOT_FOUND:
            statusCode = HttpStatus.NOT_FOUND;
            break;
          case status.ALREADY_EXISTS:
            statusCode = HttpStatus.BAD_REQUEST;
            break;
          case status.INVALID_ARGUMENT:
            statusCode = HttpStatus.BAD_REQUEST;
            break;
          case status.INTERNAL:
            statusCode = HttpStatus.SERVICE_UNAVAILABLE;
            message = 'Service Unavailable';
            break;
        }
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      const res = exception.getResponse();
      if (typeof res === 'string') extras.details = res;
      else extras = res as Record<string, unknown>;
    } else {
      const { code, details } = exception;
      console.log({ code, details });
    }

    if (extras.error_code) delete extras.error_code;
    const errorData = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...extras,
    };
    if (statusCode.toString().charAt(0) === '5') {
      Sentry.captureException({
        errorData,
      });
    }
    response.status(statusCode).json(errorData);
  }
}
