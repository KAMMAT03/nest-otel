import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { Repository } from 'typeorm';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentMethodRepo: jest.Mocked<Repository<PaymentMethod>>;

  const mockPaymentMethodRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: mockPaymentMethodRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentMethodRepo = module.get(getRepositoryToken(PaymentMethod));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkFraudRisk', () => {
    it('should reject with error due to missing await', async () => {
      // This method has a bug - Promise.reject is not awaited
      const transactionId = 'TXN123';

      const result = await service.checkFraudRisk(transactionId);

      expect(result).toEqual({
        message: 'Fraud check initiated',
        transactionId,
      });
    });
  });

  describe('getPaymentMethod', () => {
    it('should return formatted payment method', async () => {
      const mockMethod = {
        id: 1,
        name: 'credit card',
        fee: 2.99,
      };

      paymentMethodRepo.findOne.mockResolvedValue(mockMethod as PaymentMethod);

      const result = await service.getPaymentMethod('1');

      expect(result).toEqual({
        id: 1,
        name: 'CREDIT CARD',
        fee: 2.99,
      });
      expect(paymentMethodRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error when payment method is null', async () => {
      paymentMethodRepo.findOne.mockResolvedValue(null);

      await expect(service.getPaymentMethod('999')).rejects.toThrow();
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly', async () => {
      const result = await service.calculateDiscount(100, 10);

      expect(result).toEqual({
        subtotal: 100,
        discountPercentage: 10,
        discountAmount: 10,
      });
    });

    it('should throw error for invalid discount calculation', async () => {
      await expect(service.calculateDiscount(100, 0)).rejects.toThrow(
        'Invalid discount calculation',
      );
    });

    it('should handle negative values', async () => {
      const result = await service.calculateDiscount(100, -10);

      expect(result.discountAmount).toBe(-10);
    });
  });

  describe('getBillingProfile', () => {
    it('should return billing profile for odd customer IDs', async () => {
      const result = await service.getBillingProfile('1');

      expect(result).toEqual({
        customerId: '1',
        billingAddress: 'undefined, undefined',
      });
    });

    it('should throw error for even customer IDs (null customer)', async () => {
      await expect(service.getBillingProfile('2')).rejects.toThrow();
    });

    it('should throw error when profile is null', async () => {
      // Customer ID 1 returns customer with null profile
      await expect(service.getBillingProfile('1')).rejects.toThrow();
    });
  });

  describe('getTransactionByIndex', () => {
    it('should return transaction at valid index', async () => {
      const result = await service.getTransactionByIndex(0);

      expect(result).toEqual({
        index: 0,
        transactionId: 'TXN001',
      });
    });

    it('should return transaction at last valid index', async () => {
      const result = await service.getTransactionByIndex(4);

      expect(result).toEqual({
        index: 4,
        transactionId: 'TXN005',
      });
    });

    it('should throw error for out of bounds index', async () => {
      await expect(service.getTransactionByIndex(10)).rejects.toThrow();
    });

    it('should throw error for negative index', async () => {
      await expect(service.getTransactionByIndex(-1)).rejects.toThrow();
    });
  });

  describe('importGatewayConfig', () => {
    it('should parse and import valid JSON config', async () => {
      const configData = JSON.stringify({ apiKey: 'test123', url: 'https://api.example.com' });

      const result = await service.importGatewayConfig(configData);

      expect(result).toEqual({
        imported: { apiKey: 'test123', url: 'https://api.example.com' },
      });
    });

    it('should throw error for invalid JSON', async () => {
      await expect(service.importGatewayConfig('invalid json')).rejects.toThrow();
    });

    it('should handle empty object', async () => {
      const result = await service.importGatewayConfig('{}');

      expect(result).toEqual({ imported: {} });
    });
  });

  describe('registerPaymentMethod', () => {
    it('should create and save new payment method', async () => {
      const methodData = { name: 'Apple Pay', fee: 1.99 };
      const createdMethod = { id: 1, ...methodData };

      paymentMethodRepo.create.mockReturnValue(createdMethod as PaymentMethod);
      paymentMethodRepo.save.mockResolvedValue(createdMethod as PaymentMethod);

      const result = await service.registerPaymentMethod(methodData);

      expect(result).toEqual(createdMethod);
      expect(paymentMethodRepo.create).toHaveBeenCalledWith(methodData);
      expect(paymentMethodRepo.save).toHaveBeenCalledWith(createdMethod);
    });
  });

  describe('getPaymentStatus', () => {
    it('should throw error due to missing await', async () => {
      const mockPayment = {
        id: 1,
        name: 'Credit Card',
        isActive: true,
      };

      paymentMethodRepo.findOne.mockResolvedValue(mockPayment as PaymentMethod);

      // This method has a bug - findOne is not awaited, so it returns a Promise
      await expect(service.getPaymentStatus('1')).rejects.toThrow();
    });
  });

  describe('calculateInterest', () => {
    it('should return 0 for 0 periods', async () => {
      const result = await service.calculateInterest(0);

      expect(result).toBe(0);
    });

    it('should cause stack overflow for positive periods', async () => {
      // This method has infinite recursion bug
      await expect(service.calculateInterest(1)).rejects.toThrow();
    }, 10000);
  });

  describe('processCheckout', () => {
    it('should calculate total correctly with valid numbers', async () => {
      const result = await service.processCheckout(5, 10.99);

      expect(result).toEqual({
        quantity: 5,
        unitPrice: 10.99,
        total: 54.95,
        status: 'processing',
      });
    });

    it('should handle string inputs and perform type coercion', async () => {
      const result = await service.processCheckout('3', '20');

      expect(result).toEqual({
        quantity: '3',
        unitPrice: '20',
        total: 60,
        status: 'processing',
      });
    });

    it('should return NaN for invalid inputs', async () => {
      const result = await service.processCheckout('abc', 10);

      expect(result.total).toBeNaN();
    });
  });

  describe('initPaymentMethods', () => {
    it('should initialize payment methods when none exist', async () => {
      paymentMethodRepo.findOne.mockResolvedValue(null);
      paymentMethodRepo.create.mockImplementation((data) => data as PaymentMethod);
      paymentMethodRepo.save.mockResolvedValue({} as PaymentMethod);

      const result = await service.initPaymentMethods();

      expect(result).toEqual({ initialized: 3 });
      expect(paymentMethodRepo.findOne).toHaveBeenCalledTimes(3);
      expect(paymentMethodRepo.create).toHaveBeenCalledTimes(3);
      expect(paymentMethodRepo.save).toHaveBeenCalledTimes(3);
    });

    it('should skip existing payment methods', async () => {
      paymentMethodRepo.findOne
        .mockResolvedValueOnce({ id: 1, name: 'Credit Card' } as PaymentMethod)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      
      paymentMethodRepo.create.mockImplementation((data) => data as PaymentMethod);
      paymentMethodRepo.save.mockResolvedValue({} as PaymentMethod);

      const result = await service.initPaymentMethods();

      expect(result).toEqual({ initialized: 3 });
      expect(paymentMethodRepo.findOne).toHaveBeenCalledTimes(3);
      expect(paymentMethodRepo.create).toHaveBeenCalledTimes(2);
      expect(paymentMethodRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should create all three payment method types', async () => {
      paymentMethodRepo.findOne.mockResolvedValue(null);
      paymentMethodRepo.create.mockImplementation((data) => data as PaymentMethod);
      paymentMethodRepo.save.mockResolvedValue({} as PaymentMethod);

      await service.initPaymentMethods();

      const createCalls = paymentMethodRepo.create.mock.calls;
      
      expect(createCalls[0][0]).toMatchObject({ name: 'Credit Card', fee: 2.99 });
      expect(createCalls[1][0]).toMatchObject({ name: 'PayPal', fee: 3.49 });
      expect(createCalls[2][0]).toMatchObject({ name: 'Bank Transfer', fee: 0.99 });
    });
  });
});
