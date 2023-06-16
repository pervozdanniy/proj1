import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import process from 'process';
import { GrpcException, isGrpcException } from '~common/utils/exceptions/grpc.exception';
import { ErrorType } from '../enums';
import { HttpErrorType } from './http-error-type';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    let wrappedEx = exception;
    let errorType, message;

    if (process.env.NODE_ENV === 'dev') {
      // eslint-disable-next-line no-console
      console.error(exception);
    }

    if (isGrpcException(exception)) {
      wrappedEx = GrpcException.toHttp(exception);
      message = exception.details;
    } else {
      ({ errorType, message } = wrappedEx.getResponse() as {
        errorType: ErrorType | string;
        message: string | string[];
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = +wrappedEx.getStatus();

    if (!errorType) {
      errorType = HttpErrorType[status as keyof typeof HttpErrorType];
      errorType = errorType ?? 'UNEXPECTED_ERROR';
    }

    response.status(status).json({
      statusCode: status,
      errorType,
      message,
      timestamp: new Date().getTime(),
    });
  }
}
