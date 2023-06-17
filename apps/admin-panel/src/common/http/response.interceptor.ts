import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../../common/dtos';

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T> {
  /**
   * Intercept the request and add the timestamp
   * @param _context {ExecutionContext}
   * @param next {CallHandler}
   * @returns { payload:Response<T>, timestamp: string }
   */
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
    const timestamp = new Date().getTime();

    return next.handle().pipe(
      map((payload) => {
        return { payload, timestamp };
      }),
    );
  }
}
