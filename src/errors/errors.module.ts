import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorsController } from './errors.controller';
import { ErrorsService } from './errors.service';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ErrorsController],
  providers: [ErrorsService]
})
export class ErrorsModule {}
