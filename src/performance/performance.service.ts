import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PerformanceService {
  private leakyArray: any = [];
  private largeFilePath = path.join(process.cwd(), 'large-file.txt');

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
  ) {
    this.ensureLargeFileExists();
  }

  private ensureLargeFileExists() {
    if (!fs.existsSync(this.largeFilePath)) {
      const content = 'x'.repeat(10 * 1024 * 1024); // 10MB file
      fs.writeFileSync(this.largeFilePath, content);
    }
  }

  // Seed database with test data
  async seedDatabase(usersCount: number = 100, postsPerUser: number = 20) {
    const users: User[] = [];

    for (let i = 0; i < usersCount; i++) {
      const user = this.userRepo.create({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        description: `This is user number ${i} with some description text`,
      });
      users.push(await this.userRepo.save(user));
    }

    for (const user of users) {
      for (let j = 0; j < postsPerUser; j++) {
        const post = this.postRepo.create({
          title: `Post ${j} by ${user.name}`,
          description: `This is a detailed description of post ${j}. It contains various keywords like performance, optimization, and testing.`,
          userId: user.id,
        });
        await this.postRepo.save(post);
      }
    }

    return { users: usersCount, posts: usersCount * postsPerUser };
  }

  // Issue 1: N+1 Query Problem
  // Expected OTEL: Multiple spans with db.system=sqlite, high span count, total duration > 500ms
  async getUsersWithPostsN1() {
    const users: User[] = await this.userRepo.find({ take: 50 });

    // BAD: Separate query for each user (N+1 problem)
    const usersWithPosts: any = [];
    for (const user of users) {
      const posts = await this.postRepo.find({ where: { userId: user.id } });
      usersWithPosts.push({ ...user, posts });
    }

    return { count: usersWithPosts.length, data: usersWithPosts };
  }

  // Issue 2: Inefficient Fibonacci - Exponential time complexity
  // Expected OTEL: Single span with duration > 1s for n=35, high CPU
  inefficientFibonacci(n: number): number {
    if (n <= 1) return n;
    // O(2^n) - Very bad! Each call spawns 2 more calls
    return this.inefficientFibonacci(n - 1) + this.inefficientFibonacci(n - 2);
  }

  // Issue 3: Memory Leak - Never clears the array
  // Expected OTEL: Increasing memory usage over multiple calls, heap size growth
  causeMemoryLeak() {
    // Continuously growing array - never cleared
    const data = new Array(100000).fill('memory leak data ' + Date.now());
    this.leakyArray.push(...data);

    return {
      leakedItems: this.leakyArray.length,
      memoryUsage: process.memoryUsage(),
    };
  }

  // Issue 4: Unindexed Database Query - Table scan
  // Expected OTEL: db span with duration > 500ms, full table scan
  async unindexedSearch(term: string) {
    // BAD: 'description' field is not indexed - will do full table scan
    return this.postRepo
      .createQueryBuilder('post')
      .where('post.description LIKE :term', { term: `%${term}%` })
      .limit(100)
      .getMany();
  }

  // Issue 5: Synchronous File I/O - Blocks event loop
  // Expected OTEL: Single blocking span with duration > 100ms, blocks other requests
  synchronousFileRead() {
    // BAD: Synchronous blocking call - will block event loop
    const data = fs.readFileSync(this.largeFilePath, 'utf-8');
    return {
      bytesRead: data.length,
      readType: 'synchronous',
    };
  }

  // Issue 6: Missing Cache - Recalculates every time
  // Expected OTEL: High CPU usage, repeated identical operations with same input
  async expensiveWithoutCache(id: string) {
    // BAD: Should be cached, but recalculates every single time
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.sqrt(i * parseInt(id));
    }

    return {
      result,
      id,
      cached: false,
    };
  }

  // Issue 7: Inefficient Nested Loops - O(n³) complexity
  // Expected OTEL: Very high duration for size > 100, CPU intensive
  inefficientNestedLoops(size: number) {
    const result: number[] = [];

    // BAD: Triple nested loop - O(n³) complexity
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          result.push(i * j * k);
        }
      }
    }

    return {
      computed: result.length,
      size,
      complexity: 'O(n³)',
    };
  }

  // Utility method to clear memory leak for testing
  clearMemoryLeak() {
    const itemsCleared = this.leakyArray.length;
    this.leakyArray = [];
    return { itemsCleared };
  }
}
