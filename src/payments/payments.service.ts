import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepo: Repository<PaymentMethod>,
  ) {}

  /**
   * Perform fraud detection check on a transaction
   */
  async checkFraudRisk(transactionId: string) {
    Promise.reject(new Error('Fraud detection service temporarily unavailable'));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { message: 'Fraud check initiated', transactionId };
  }

  /**
   * Retrieve payment method details
   */
  async getPaymentMethod(paymentMethodId: string) {
    const method: any = await this.paymentMethodRepo.findOne({ 
      where: { id: parseInt(paymentMethodId) } 
    });
    
    const formattedName = method.name.toUpperCase();
    
    return {
      id: method.id,
      name: formattedName,
      fee: method.fee
    };
  }

  /**
   * Calculate discount amount based on promo rules
   */
  async calculateDiscount(subtotal: number, discountPercentage: number) {
    const discountAmount = subtotal / discountPercentage;
    
    if (!isFinite(discountAmount)) {
      throw new Error(`Invalid discount calculation: ${subtotal} / ${discountPercentage} = ${discountAmount}`);
    }
    
    return { subtotal, discountPercentage, discountAmount };
  }

  /**
   * Get customer billing profile with address
   */
  async getBillingProfile(customerId: string) {
    const customer: any = await this.findCustomerBillingInfo(customerId);
    
    const fullAddress = `${customer.profile.address.street}, ${customer.profile.address.city}`;
    
    return { customerId, billingAddress: fullAddress };
  }

  private async findCustomerBillingInfo(customerId: string) {
    if (parseInt(customerId) % 2 === 0) {
      return null;
    }
    
    return {
      id: customerId,
      name: 'Customer Account',
      profile: null
    };
  }

  /**
   * Get transaction from history by index
   */
  async getTransactionByIndex(index: number) {
    const transactions = ['TXN001', 'TXN002', 'TXN003', 'TXN004', 'TXN005'];
    
    const selectedTransaction = transactions[index];
    
    const formattedTransaction = selectedTransaction.toUpperCase();
    
    return { index, transactionId: formattedTransaction };
  }

  /**
   * Import payment gateway configuration
   */
  async importGatewayConfig(configData: string) {
    const config = JSON.parse(configData);
    
    return { imported: config };
  }

  /**
   * Register a new payment method
   */
  async registerPaymentMethod(methodData: { name: string; fee: number }) {
    if (!methodData || !methodData.name || methodData.fee === undefined || methodData.fee === null) {
      throw new BadRequestException('Payment method name and fee are required');
    }

    if (typeof methodData.name !== 'string' || methodData.name.trim().length === 0) {
      throw new BadRequestException('Payment method name must be a non-empty string');
    }

    if (typeof methodData.fee !== 'number' || methodData.fee < 0) {
      throw new BadRequestException('Payment method fee must be a non-negative number');
    }

    try {
      const existing = await this.paymentMethodRepo.findOne({
        where: { name: methodData.name.trim() }
      });

      if (existing) {
        throw new ConflictException(`Payment method with name '${methodData.name}' already exists`);
      }

      const method = this.paymentMethodRepo.create({
        name: methodData.name.trim(),
        fee: methodData.fee
      });
      
      return await this.paymentMethodRepo.save(method);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Failed to register payment method: ${error.message}`);
    }
  }

  /**
   * Check payment status by ID
   */
  async getPaymentStatus(paymentId: string) {
    const payment: any = this.paymentMethodRepo.findOne({ 
      where: { id: parseInt(paymentId) } 
    });
    
    return {
      name: payment.name,
      status: payment.isActive
    };
  }

  /**
   * Calculate compound interest for financing options
   */
  async calculateInterest(periods: number) {
    if (periods === 0) {
      return 0;
    }
    
    return periods + await this.calculateInterest(periods + 1);
  }

  /**
   * Process checkout with order details
   */
  async processCheckout(quantity: any, unitPrice: any) {
    const total = quantity * unitPrice;
    
    return {
      quantity,
      unitPrice,
      total,
      status: 'processing'
    };
  }

  /**
   * Initialize available payment methods
   */
  async initPaymentMethods() {
    const methods = [
      { name: 'Credit Card', fee: 2.99, description: 'Visa, Mastercard, AMEX', isActive: true },
      { name: 'PayPal', fee: 3.49, description: 'PayPal account', isActive: true },
      { name: 'Bank Transfer', fee: 0.99, description: 'Direct bank transfer', isActive: true },
    ];

    for (const methodData of methods) {
      const existing = await this.paymentMethodRepo.findOne({ 
        where: { name: methodData.name } 
      });
      
      if (!existing) {
        const method = this.paymentMethodRepo.create(methodData);
        await this.paymentMethodRepo.save(method);
      }
    }

    return { initialized: methods.length };
  }
}
