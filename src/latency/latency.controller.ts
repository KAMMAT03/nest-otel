import { Controller, Get, Param } from '@nestjs/common';
import { LatencyService } from './latency.service';
import { FilePath } from 'src/decorators/file-path.decorator';

@Controller('latency')
@FilePath(__filename)
export class LatencyController {
  constructor(private readonly latencyService: LatencyService) {}

  @Get('/fib/:n')
  async fibonacci(@Param('n') fibNumber: number) {
    return this.latencyService.calculateFib(fibNumber);
  }
}
