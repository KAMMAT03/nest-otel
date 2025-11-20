import { Controller, Get, Post, Param, Body, Query, HttpCode } from '@nestjs/common';
import { ErrorsService } from './errors.service';

@Controller('errors')
export class ErrorsController {
  constructor(private readonly errorService: ErrorsService) {}

  // Seed products for testing
  @Post('seed')
  @HttpCode(201)
  async seedProducts() {
    return this.errorService.seedProducts();
  }

  // Error 1: Unhandled Promise Rejection
  // Test with: GET /errors/unhandled-promise
  // Expected OTEL: ERROR status, unhandled rejection in logs
  @Get('unhandled-promise')
  async unhandledPromise() {
    return this.errorService.unhandledPromiseError();
  }

  // Error 2: Type Error - Undefined property access
  // Test with: GET /errors/type-error/999 (non-existent product)
  // Expected OTEL: ERROR status, exception.type = TypeError
  @Get('type-error/:productId')
  async typeError(@Param('productId') productId: string) {
    return this.errorService.causeTypeError(productId);
  }

  // Error 3: Division by Zero
  // Test with: POST /errors/divide {"a": 10, "b": 0}
  // Expected OTEL: ERROR status, invalid calculation
  @Post('divide')
  async divide(@Body() body: { a: number; b: number }) {
    return this.errorService.divideNumbers(body.a, body.b);
  }

  // Error 4: Null Reference
  // Test with: GET /errors/null-reference/2 (even ID returns null)
  // Expected OTEL: ERROR status, exception.type = TypeError
  @Get('null-reference/:userId')
  async nullReference(@Param('userId') userId: string) {
    return this.errorService.accessNullProperty(userId);
  }

  // Error 5: Array Index Out of Bounds
  // Test with: GET /errors/array-error/10
  // Expected OTEL: ERROR status, exception.type = TypeError
  @Get('array-error/:index')
  async arrayError(@Param('index') index: string) {
    return this.errorService.arrayAccessError(parseInt(index));
  }

  // Error 6: JSON Parsing Error
  // Test with: GET /errors/parse-json?data=invalid{json}
  // Expected OTEL: ERROR status, exception.type = SyntaxError
  @Get('parse-json')
  async parseJson(@Query('data') data: string) {
    return this.errorService.parseInvalidJson(data);
  }

  // Error 7: Database Constraint Violation
  // Test with: POST /errors/duplicate-product {"name": "Product A", "price": 19.99}
  // Expected OTEL: ERROR status, db constraint violation
  @Post('duplicate-product')
  async duplicateProduct(@Body() body: { name: string; price: number }) {
    return this.errorService.createDuplicateProduct(body);
  }

  // Error 8: Missing Await
  // Test with: GET /errors/missing-await/1
  // Expected OTEL: ERROR status, cannot read property of Promise
  @Get('missing-await/:productId')
  async missingAwait(@Param('productId') productId: string) {
    return this.errorService.missingAwait(productId);
  }

  // Error 9: Stack Overflow - Infinite Recursion
  // Test with: GET /errors/stack-overflow/1
  // Expected OTEL: ERROR status, RangeError (Maximum call stack size exceeded)
  @Get('stack-overflow/:n')
  async stackOverflow(@Param('n') n: string) {
    return this.errorService.causeStackOverflow(parseInt(n));
  }

  // Error 10: Invalid Input Validation
  // Test with: POST /errors/process-order {"quantity": "abc", "price": -10}
  // Expected OTEL: ERROR status or invalid data
  @Post('process-order')
  async processOrder(@Body() body: { quantity: any; price: any }) {
    return this.errorService.processOrder(body.quantity, body.price);
  }
}
