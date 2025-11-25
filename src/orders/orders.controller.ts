import { Controller, Get, Post, Param, Query, Body, HttpCode } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { InitSampleDataDto } from './dto/init-sample-data.dto';
import { FilePath } from 'src/decorators/file-path.decorator';

@FilePath(__filename)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Initialize sample e-commerce data
   */
  @Post('init-sample-data')
  @HttpCode(201)
  async initSampleData(@Body() dto: InitSampleDataDto) {
    return this.ordersService.initSampleData(
      dto.customersCount || 100,
      dto.ordersPerCustomer || 20
    );
  }

  /**
   * Get customer dashboard with order history
   */
  @Get('customer/:customerId/dashboard')
  async getCustomerDashboard(@Param('customerId') customerId: string) {
    return this.ordersService.getCustomerDashboard(customerId);
  }

  /**
   * Calculate shipping cost for a specific zone
   */
  @Get('shipping-cost/:zoneId')
  async getShippingCost(@Param('zoneId') zoneId: string) {
    const cost = this.ordersService.calculateShippingCost(parseInt(zoneId));
    return { zoneId: parseInt(zoneId), shippingCost: cost };
  }

  /**
   * Track user session for analytics
   */
  @Get('analytics/track-session')
  async trackSession() {
    return this.ordersService.trackAnalyticsSession();
  }

  /**
   * Search product catalog
   */
  @Get('catalog/search')
  async searchCatalog(@Query('q') searchTerm: string) {
    return this.ordersService.searchCatalog(searchTerm || 'product');
  }

  /**
   * Export order report
   */
  @Get('reports/export')
  async exportReport() {
    return this.ordersService.exportReport();
  }

  /**
   * Get personalized product recommendations
   */
  @Get('recommendations/:customerId')
  async getRecommendations(@Param('customerId') customerId: string) {
    return this.ordersService.getRecommendations(customerId);
  }

  /**
   * Analyze inventory restock requirements
   */
  @Get('inventory/restock-analysis/:warehouseCount')
  async analyzeRestock(@Param('warehouseCount') warehouseCount: string) {
    return this.ordersService.analyzeRestockRequirements(parseInt(warehouseCount));
  }
}
