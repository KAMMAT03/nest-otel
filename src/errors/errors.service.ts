import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ErrorsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  // Error 1: Unhandled Promise Rejection
  // Expected OTEL: ERROR status, exception.type = UnhandledPromiseRejection
  async unhandledPromiseError() {
    // BAD: Promise rejection without proper error handling
    Promise.reject(new Error('Unhandled promise rejection in background task'));

    // Simulate some async work
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      message: 'Request completed, but check logs for unhandled rejection',
    };
  }

  // Error 2: Type Error - Accessing property of undefined
  // Expected OTEL: ERROR status, exception.type = TypeError
  async causeTypeError(productId: string) {
    // BAD: Not checking if product exists before accessing properties
    const product: any = await this.productRepo.findOne({
      where: { id: parseInt(productId) },
    });

    // This will throw TypeError if product is null
    const upperCaseName = product.name.toUpperCase();

    return {
      id: product.id,
      name: upperCaseName,
      price: product.price,
    };
  }

  // Error 3: Division by Zero / NaN
  // Expected OTEL: ERROR status or invalid result attributes
  async divideNumbers(a: number, b: number) {
    // BAD: No validation of inputs
    const result = a / b;

    // This will produce Infinity or NaN for invalid inputs
    if (!isFinite(result)) {
      throw new Error(`Invalid division result: ${a} / ${b} = ${result}`);
    }

    return { a, b, result };
  }

  // Error 4: Null Reference / Undefined Property Access
  // Expected OTEL: ERROR status, exception.type = TypeError
  async accessNullProperty(userId: string) {
    // BAD: Simulating accessing nested properties without null checks
    const user: any = await this.findUserById(userId); // May return null

    // This will throw if user or user.profile is null/undefined
    const fullAddress = `${user.profile.address.street}, ${user.profile.address.city}`;

    return { userId, address: fullAddress };
  }

  // Helper method that simulates user lookup (intentionally returns null sometimes)
  private async findUserById(userId: string) {
    // Simulate database lookup that might return null
    if (parseInt(userId) % 2 === 0) {
      return null; // Even IDs return null
    }

    return {
      id: userId,
      name: 'Test User',
      profile: null, // Profile is also null sometimes
    };
  }

  // Error 5: Array Index Out of Bounds
  // Expected OTEL: ERROR status, exception.type = RangeError or TypeError
  async arrayAccessError(index: number) {
    const items = ['item1', 'item2', 'item3', 'item4', 'item5'];

    // BAD: No bounds checking
    const selectedItem = items[index];

    // This will be undefined for out-of-bounds access
    // Calling methods on undefined will throw
    const upperCaseItem = selectedItem.toUpperCase();

    return { index, item: upperCaseItem };
  }

  // Error 6: JSON Parsing Error
  // Expected OTEL: ERROR status, exception.type = SyntaxError
  async parseInvalidJson(jsonString: string) {
    // BAD: No try-catch for JSON parsing
    const parsed = JSON.parse(jsonString);

    return { parsed };
  }

  // Error 7: Database Constraint Violation
  // Expected OTEL: ERROR status, db.statement attribute, exception about constraint
  async createDuplicateProduct(productData: { name: string; price: number }) {
    // BAD: Not checking for existing product
    // Assumes 'name' has a UNIQUE constraint
    const product = this.productRepo.create(productData);

    // This will throw if product with same name exists
    return await this.productRepo.save(product);
  }

  // Error 8: Async/Await Missing - Promise not awaited
  // Expected OTEL: Inconsistent data, possible race conditions
  async missingAwait(productId: string) {
    // BAD: Not awaiting the promise
    const product: any = this.productRepo.findOne({
      where: { id: parseInt(productId) },
    }); // Returns Promise, not Product!

    // This will fail because product is a Promise object
    return {
      // @ts-ignore - TypeScript would catch this, but simulating JS error
      name: product.name,
      price: product.price,
    };
  }

  // Error 9: Stack Overflow - Infinite Recursion
  // Expected OTEL: ERROR status, exception.type = RangeError (Maximum call stack size exceeded)
  async causeStackOverflow(n: number) {
    // BAD: Recursive function without base case
    if (n === 0) {
      return 0;
    }

    // Intentional bug: should be n-1, but uses n+1 (never reaches base case)
    return n + (await this.causeStackOverflow(n + 1));
  }

  // Error 10: Invalid Input Validation
  // Expected OTEL: ERROR status, validation error attributes
  async processOrder(quantity: any, price: any) {
    // BAD: No input validation
    const total = quantity * price;

    // Create order with invalid data
    return {
      quantity,
      price,
      total,
      status: 'created',
    };
  }

  // Seed products for testing
  async seedProducts() {
    const products = [
      {
        name: 'Product A',
        price: 19.99,
        stock: 100,
        description: 'First product',
      },
      {
        name: 'Product B',
        price: 29.99,
        stock: 50,
        description: 'Second product',
      },
      {
        name: 'Product C',
        price: 39.99,
        stock: 75,
        description: 'Third product',
      },
    ];

    for (const productData of products) {
      const existing = await this.productRepo.findOne({
        where: { name: productData.name },
      });

      if (!existing) {
        const product = this.productRepo.create(productData);
        await this.productRepo.save(product);
      }
    }

    return { seeded: products.length };
  }
}
