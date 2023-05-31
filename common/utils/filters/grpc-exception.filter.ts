import { ServerUnaryCall, status } from '@grpc/grpc-js';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import * as Sentry from '@sentry/node';
import { Observable, throwError } from 'rxjs';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { GrpcException } from '../exceptions/grpc.exception';

export class BaseGrpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const status = 'error';
    if (!(exception instanceof GrpcException)) {
      return this.handleUnknownError(exception, status);
    }

    const res = exception.getError();
    const message = isObject(res) ? res : { status, message: res };
    if (exception.metadata) {
      const call = host.getArgByIndex<ServerUnaryCall<any, any>>(2);
      call.sendMetadata(exception.metadata);
    }

    return throwError(() => message);
  }

  handleUnknownError(exception: any, status: string): Observable<never> {
    Sentry.captureException({ exception });

    return super.handleUnknownError(exception, status);
  }
}

@Catch()
export class AllExceptionFilter extends BaseGrpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    if (process.env.NODE_ENV === 'dev') {
      console.log('EX:', exception.response?.data ?? exception);
    }
    let finalException = exception;

    if (exception instanceof HttpException) {
      finalException = GrpcException.fromHttp(exception);
    }

    if (exception instanceof EntityNotFoundError) {
      finalException = new GrpcException(status.NOT_FOUND, 'Not Found');
    }

    if (exception instanceof QueryFailedError && exception.message.includes('duplicate key')) {
      finalException = new GrpcException(status.ALREADY_EXISTS, 'Duplicate Entry');
    }

    return super.catch(finalException, host);
  }
}
