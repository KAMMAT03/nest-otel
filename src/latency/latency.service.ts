import { Injectable } from '@nestjs/common';

@Injectable()
export class LatencyService {
  private fibCache: Map<number, number> = new Map();

  calculateFib(fibNumber: number): number {
    // Check cache first
    if (this.fibCache.has(fibNumber)) {
      return this.fibCache.get(fibNumber);
    }

    // Base cases
    if (fibNumber <= 1) {
      return fibNumber;
    }

    // Calculate and cache the result
    const result = this.calculateFib(fibNumber - 1) + this.calculateFib(fibNumber - 2);
    this.fibCache.set(fibNumber, result);
    
    return result;
  }
}
