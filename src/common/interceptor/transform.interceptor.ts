import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    call$: Observable<T>,
  ): Observable<any> {
    return call$.pipe(map(data => {
      if (typeof (data) === 'string' && data.indexOf('<xml>') > -1) {
        return data
      } else {
        return { status: 200, data }
      }
    }));
  }
}