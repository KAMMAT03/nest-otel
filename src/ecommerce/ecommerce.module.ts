import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Author } from './entities/author.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { Room } from './entities/room.entity';
import { ECommerceController } from './ecommerce.controller';
import { ECommerceService } from './ecommerce.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'ecommerce.db',
      entities: [User, Post, Author, Order, Product, Room],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([User, Post, Author, Order, Product, Room]),
  ],
  controllers: [ECommerceController],
  providers: [ECommerceService],
})
export class ECommerceModule {}
