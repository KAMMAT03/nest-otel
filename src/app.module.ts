import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LatencyModule } from './latency/latency.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OpenTelemetryInterceptor } from './interceptors/otel.interceptor';

@Module({
  imports: [LatencyModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: OpenTelemetryInterceptor
    }
  ],
})
export class AppModule {}
