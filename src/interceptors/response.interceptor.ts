import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const type = context.getType() as any;
    if (type == 'telegraf') {
      return next.handle();
    }
    
    return next.handle().pipe(
      map((data: any) => this.responseHandler(data, context)),
      catchError((error: HttpException) => {
        Logger.log(
          `\n<<<<<<<<<<FIX ERROR NOW>>>>>>>>>>\n ${error} +${
            Date.now() - now
          }ms \n<<<<<<<<<<FIX ERROR NOW>>>>>>>>>>\n`,
          context.getClass().name,
        );
        return throwError(() => this.errorHandler(error, context));
      }),
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Check if headers have already been sent
    if (!response.headersSent) {
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        status: false,
        statusCode: status,
        path: request.url,
        message: exception?.message,
        error: exception.name,
      });
    }
  }

  responseHandler(data: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const code = response.statusCode;

    return {
      status: true,
      path: request.url,
      statusCode: code,
      data,
    };
  }
}
