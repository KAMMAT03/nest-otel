import { Test, TestingModule } from '@nestjs/testing';
import { LatencyController } from './latency.controller';

describe('LatencyController', () => {
  let controller: LatencyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LatencyController],
    }).compile();

    controller = module.get<LatencyController>(LatencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
