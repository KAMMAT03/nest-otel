import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { User } from 'src/performance/entities/user.entity';
import { Post } from 'src/performance/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post])],
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
