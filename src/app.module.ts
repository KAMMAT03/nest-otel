import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LatencyModule } from './latency/latency.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OpenTelemetryInterceptor } from './interceptors/otel.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { PerformanceModule } from './performance/performance.module';
import { ErrorsModule } from './errors/errors.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'test.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    LatencyModule,
    PerformanceModule,
    ErrorsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OpenTelemetryInterceptor
    }
  ],
})
export class AppModule {}
