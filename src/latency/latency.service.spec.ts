import { Test, TestingModule } from '@nestjs/testing';
import { LatencyService } from './latency.service';

describe('LatencyService', () => {
  let service: LatencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LatencyService],
    }).compile();

    service = module.get<LatencyService>(LatencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
