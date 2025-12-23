import { Controller, Get, Post as PostMethod, Body, Query, Param } from '@nestjs/common';
import { ECommerceService } from './ecommerce.service';
import { FilePath } from 'src/decorators/file-path.decorator';

@FilePath(__filename)
@Controller('api')
export class ECommerceController {
  constructor(
    private readonly ecommerceService: ECommerceService,
  ) {}

  @Get('users/search')
  async searchUser(@Query('email') email: string) {
    return this.ecommerceService.findUserByEmail(email);
  }

  @PostMethod('bookings/room')
  async bookRoom(@Body() data: { roomId: string; userId: string }) {
    return this.ecommerceService.bookRoom(data.roomId, data.userId);
  }

  @PostMethod('orders/calculate')
  async calculateOrder(@Body() data: { items: any[]; userId: string }) {
    return this.ecommerceService.calculateOrderTotal(data.items, data.userId);
  }

  @Get('products/sort')
  async sortProducts(@Query('limit') limit: string) {
    return this.ecommerceService.sortProducts(parseInt(limit) || 10000);
  }

  @Get('products/search')
  async searchProducts(@Query('query') query: string) {
    return this.ecommerceService.searchProducts(query);
  }

  @Get('posts/with-authors')
  async getPostsWithAuthors(@Query('ids') ids: string) {
    const postIds = ids.split(',');
    return this.ecommerceService.getPostsWithAuthors(postIds);
  }

  @Get('orders/process')
  async processOrders() {
    return this.ecommerceService.processOrders();
  }

  @PostMethod('registration/validate')
  async validateRegistration(@Body() formData: any) {
    return this.ecommerceService.validateRegistration(formData);
  }

  @Get('analytics/revenue')
  async calculateRevenue(@Query('days') days: string) {
    return this.ecommerceService.calculateRevenue(parseInt(days) || 365);
  }

  @PostMethod('seed')
  async seedDatabase() {
    return this.ecommerceService.seedDatabase();
  }
}
