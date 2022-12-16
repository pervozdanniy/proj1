import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import * as Sentry from '@sentry/node';

@Catch()
export class AllExceptionFilter implements RpcExceptionFilter<unknown> {
  catch(exception: unknown): Observable<any> {
    console.log('ALL EX', exception);
    Sentry.captureException({ exception });

    return throwError(() => new RpcException({ message: 'Unknown error', exception }));
  }
}
