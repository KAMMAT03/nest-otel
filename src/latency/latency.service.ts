import { Injectable } from '@nestjs/common';

@Injectable()
export class LatencyService {
  calculateFib(fibNumber: number): number {
    if (fibNumber <= 1) return fibNumber;
    return this.calculateFib(fibNumber - 1) + this.calculateFib(fibNumber - 2);
  }
}
