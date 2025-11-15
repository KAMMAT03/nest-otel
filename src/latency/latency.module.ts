import { Module } from '@nestjs/common';
import { LatencyService } from './latency.service';
import { LatencyController } from './latency.controller';

@Module({
  providers: [LatencyService],
  controllers: [LatencyController]
})
export class LatencyModule {}
