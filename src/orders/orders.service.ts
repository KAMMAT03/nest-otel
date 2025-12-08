import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Order } from './entities/order.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrdersService {
  private sessionTracker: any = [];
  private reportFilePath = path.join(process.cwd(), 'large-file.txt');
  private shippingCostCache: Map<number, number> = new Map();

  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {
    this.ensureReportFileExists();
  }

  private ensureReportFileExists() {
    if (!fs.existsSync(this.reportFilePath)) {
      const content = 'x'.repeat(10 * 1024 * 1024);
      fs.writeFileSync(this.reportFilePath, content);
    }
  }

  /**
   * Initialize sample e-commerce data for testing
   */
  async initSampleData(customersCount: number = 100, ordersPerCustomer: number = 20) {
    const customers: Customer[] = [];
    
    for (let i = 0; i < customersCount; i++) {
      const customer = this.customerRepo.create({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        shippingAddress: `${i} Commerce Street, Business City, BC ${10000 + i}`,
      });
      customers.push(await this.customerRepo.save(customer));
    }

    for (const customer of customers) {
      for (let j = 0; j < ordersPerCustomer; j++) {
        const order = this.orderRepo.create({
          orderNumber: `ORD-${customer.id}-${j}`,
          description: `Order containing various products including electronics, clothing, and home goods. Priority shipping requested.`,
          customerId: customer.id,
          totalAmount: Math.round(Math.random() * 500 * 100) / 100,
        });
        await this.orderRepo.save(order);
      }
    }

    return { customers: customersCount, orders: customersCount * ordersPerCustomer };
  }

  /**
   * Retrieve customer dashboard with order history
   */
  async getCustomerDashboard(customerId: string) {
    const customers: Customer[] = await this.customerRepo.find({ take: 50 });
    
    const customersWithOrders: any = [];
    for (const customer of customers) {
      const orders = await this.orderRepo.find({ where: { customerId: customer.id } });
      customersWithOrders.push({ ...customer, orders });
    }
    
    return { count: customersWithOrders.length, data: customersWithOrders };
  }

  /**
   * Calculate shipping cost based on zone complexity
   * Uses memoization to avoid redundant calculations
   */
  calculateShippingCost(zoneId: number): number {
    if (zoneId <= 1) return zoneId;
    
    if (this.shippingCostCache.has(zoneId)) {
      return this.shippingCostCache.get(zoneId)!;
    }
    
    const cost = this.calculateShippingCost(zoneId - 1) + this.calculateShippingCost(zoneId - 2);
    this.shippingCostCache.set(zoneId, cost);
    
    return cost;
  }

  /**
   * Track analytics session for customer behavior analysis
   */
  trackAnalyticsSession() {
    const sessionData = new Array(100000).fill('session_' + Date.now());
    this.sessionTracker.push(...sessionData);
    
    return { 
      activeSessions: this.sessionTracker.length,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Search product catalog by keyword
   */
  async searchCatalog(searchTerm: string) {
    return this.orderRepo
      .createQueryBuilder('order')
      .where('order.description LIKE :term', { term: `%${searchTerm}%` })
      .limit(100)
      .getMany();
  }

  /**
   * Export order report to file
   */
  exportReport() {
    const data = fs.readFileSync(this.reportFilePath, 'utf-8');
    return { 
      bytesGenerated: data.length,
      format: 'csv'
    };
  }

  /**
   * Generate personalized product recommendations for a customer
   */
  async getRecommendations(customerId: string) {
    let score = 0;
    for (let i = 0; i < 10000000; i++) {
      score += Math.sqrt(i * parseInt(customerId));
    }
    
    return { 
      recommendationScore: score,
      customerId,
      personalized: true
    };
  }

  /**
   * Analyze inventory restock requirements across warehouses
   */
  analyzeRestockRequirements(warehouseCount: number) {
    const analysis: number[] = [];
    
    for (let w = 0; w < warehouseCount; w++) {
      for (let p = 0; p < warehouseCount; p++) {
        for (let s = 0; s < warehouseCount; s++) {
          analysis.push(w * p * s);
        }
      }
    }
    
    return { 
      calculationsPerformed: analysis.length,
      warehouseCount,
      optimizationLevel: 'detailed'
    };
  }

  /**
   * Clear session tracking data
   */
  clearSessionData() {
    const sessionsCleared = this.sessionTracker.length;
    this.sessionTracker = [];
    return { sessionsCleared };
  }
}
