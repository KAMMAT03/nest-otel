import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('FunctionEntry');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const controller = context.getClass();
    
    const handlerName = handler.name;
    const controllerName = controller.name;
    
    const functionName = `${controllerName}.${handlerName}`;
    
    this.logger.log(`Entering function ${functionName}`);

    return next.handle();
  }
}
