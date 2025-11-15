import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { FILE_PATH_KEY } from 'src/decorators/file-path.decorator';

@Injectable()
export class OpenTelemetryInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const tracer = trace.getTracer('nestjs-app');
    const handler = context.getHandler();
    const controller = context.getClass();
    
    const handlerName = handler.name;
    const controllerName = controller.name;
    
    // Get file path from metadata (keep full path)
    const filePath = this.reflector.get<string>(FILE_PATH_KEY, controller);
    const fileName = filePath || controllerName.toLowerCase() + '.ts';
    
    const spanName = `${controllerName}.${handlerName}`;
    
    return tracer.startActiveSpan(spanName, (span) => {
      span.setAttributes({
        'code.function': handlerName,
        'code.namespace': controllerName,
        'code.filepath': fileName, // Now contains full path like src/users/user.controller.ts
        'http.method': context.switchToHttp().getRequest()?.method,
        'http.route': context.switchToHttp().getRequest()?.route?.path,
      });

      return next.handle().pipe(
        tap({
          next: () => {
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
          },
          error: (error) => {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            span.recordException(error);
            span.end();
          },
        }),
      );
    });
  }
}
