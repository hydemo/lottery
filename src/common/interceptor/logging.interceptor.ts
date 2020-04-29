import { Injectable, NestInterceptor, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
  ) { }
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const url = request.originalUrl
    const ip = request.headers['x-real-ip'] ? request.headers['x-real-ip'] : request.ip.replace(/::ffff:/, '');
    Logger.log(url);
    Logger.log(request.method);
    Logger.log(ip);
    Logger.log(request.params);
    Logger.log(request.query)
    const body = { ...request.body }
    Logger.log(body);

    const now = Date.now();

    return call$.pipe(
      tap(() => Logger.log(`Complete... ${Date.now() - now}ms`)),
    );
  }
}