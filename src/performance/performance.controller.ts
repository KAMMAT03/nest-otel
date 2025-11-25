import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateDataDto } from './dto/create-data.dto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // Seed database for testing
  @Post('seed')
  @HttpCode(201)
  async seedDatabase(@Body() dto: CreateDataDto) {
    return this.performanceService.seedDatabase(
      dto.usersCount || 100,
      dto.postsPerUser || 20,
    );
  }

  // Issue 1: N+1 Query Problem
  // Test with: GET /performance/users-with-posts
  // Expected OTEL: Multiple db spans, duration > 500ms
  @Get('users-with-posts')
  async getUsersWithPosts() {
    return this.performanceService.getUsersWithPostsN1();
  }

  // Issue 2: Inefficient Fibonacci
  // Test with: GET /performance/fibonacci/35
  // Expected OTEL: Single span with duration > 1s
  @Get('fibonacci/:n')
  async fibonacci(@Param('n') n: string) {
    const result = this.performanceService.inefficientFibonacci(parseInt(n));
    return { n: parseInt(n), result };
  }

  // Issue 3: Memory Leak
  // Test with: Multiple calls to GET /performance/memory-leak
  // Expected OTEL: Increasing memory usage across requests
  @Get('memory-leak')
  async memoryLeak() {
    return this.performanceService.causeMemoryLeak();
  }

  // Issue 4: Unindexed Database Query
  // Test with: GET /performance/slow-search?term=performance
  // Expected OTEL: db span with duration > 500ms
  @Get('slow-search')
  async slowSearch(@Query('term') term: string) {
    return this.performanceService.unindexedSearch(term || 'test');
  }

  // Issue 5: Synchronous File Operations
  // Test with: GET /performance/sync-file-read
  // Expected OTEL: Blocking span with duration > 100ms
  @Get('sync-file-read')
  async syncFileRead() {
    return this.performanceService.synchronousFileRead();
  }

  // Issue 6: Missing Cache
  // Test with: Multiple calls to GET /performance/expensive-calculation/123
  // Expected OTEL: Repeated high CPU usage for same ID
  @Get('expensive-calculation/:id')
  async expensiveCalculation(@Param('id') id: string) {
    return this.performanceService.expensiveWithoutCache(id);
  }

  // Issue 7: Inefficient Nested Loops
  // Test with: GET /performance/nested-loops/150
  // Expected OTEL: High CPU, duration increases cubically
  @Get('nested-loops/:size')
  async nestedLoops(@Param('size') size: string) {
    return this.performanceService.inefficientNestedLoops(parseInt(size));
  }
}
