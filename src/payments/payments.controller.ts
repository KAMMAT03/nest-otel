import { Controller, Get, Post, Param, Body, Query, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { FilePath } from 'src/decorators/file-path.decorator';

@FilePath(__filename)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Initialize available payment methods
   */
  @Post('init')
  @HttpCode(201)
  async initPaymentMethods() {
    return this.paymentsService.initPaymentMethods();
  }

  /**
   * Check transaction for potential fraud
   */
  @Get('fraud-check/:transactionId')
  async checkFraud(@Param('transactionId') transactionId: string) {
    return this.paymentsService.checkFraudRisk(transactionId);
  }

  /**
   * Get payment method details
   */
  @Get('method/:paymentMethodId')
  async getPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    return this.paymentsService.getPaymentMethod(paymentMethodId);
  }

  /**
   * Calculate discount for order
   */
  @Post('calculate-discount')
  async calculateDiscount(@Body() body: { subtotal: number; discountPercentage: number }) {
    return this.paymentsService.calculateDiscount(body.subtotal, body.discountPercentage);
  }

  /**
   * Get customer billing profile
   */
  @Get('billing-profile/:customerId')
  async getBillingProfile(@Param('customerId') customerId: string) {
    return this.paymentsService.getBillingProfile(customerId);
  }

  /**
   * Get transaction from history
   */
  @Get('transaction-history/:index')
  async getTransaction(@Param('index') index: string) {
    return this.paymentsService.getTransactionByIndex(parseInt(index));
  }

  /**
   * Import gateway configuration
   */
  @Get('import-config')
  async importConfig(@Query('data') data: string) {
    return this.paymentsService.importGatewayConfig(data);
  }

  /**
   * Register new payment method
   */
  @Post('register-method')
  async registerMethod(@Body() body: { name: string; fee: number }) {
    return this.paymentsService.registerPaymentMethod(body);
  }

  /**
   * Get payment status
   */
  @Get('status/:paymentId')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPaymentStatus(paymentId);
  }

  /**
   * Calculate financing interest
   */
  @Get('financing/interest/:periods')
  async calculateInterest(@Param('periods') periods: string) {
    return this.paymentsService.calculateInterest(parseInt(periods));
  }

  /**
   * Process checkout
   */
  @Post('checkout')
  async processCheckout(@Body() body: { quantity: any; unitPrice: any }) {
    return this.paymentsService.processCheckout(body.quantity, body.unitPrice);
  }
}
