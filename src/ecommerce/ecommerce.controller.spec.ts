import { Test, TestingModule } from '@nestjs/testing';
import { ECommerceController } from './ecommerce.controller';
import { ECommerceService } from './ecommerce.service';

describe('ECommerceController', () => {
  let controller: ECommerceController;
  let service: ECommerceService;

  const mockECommerceService = {
    findUserByEmail: jest.fn(),
    bookRoom: jest.fn(),
    calculateOrderTotal: jest.fn(),
    sortProducts: jest.fn(),
    searchProducts: jest.fn(),
    getPostsWithAuthors: jest.fn(),
    processOrders: jest.fn(),
    validateRegistration: jest.fn(),
    calculateRevenue: jest.fn(),
    seedDatabase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ECommerceController],
      providers: [
        {
          provide: ECommerceService,
          useValue: mockECommerceService,
        },
      ],
    }).compile();

    controller = module.get<ECommerceController>(ECommerceController);
    service = module.get<ECommerceService>(ECommerceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchUser', () => {
    it('should call findUserByEmail with correct email', async () => {
      const email = 'test@example.com';
      const mockUser = { id: 1, email, name: 'Test User', tier: 'gold', phone: '123456789' };
      mockECommerceService.findUserByEmail.mockResolvedValue(mockUser);

      const result = await controller.searchUser(email);

      expect(service.findUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      mockECommerceService.findUserByEmail.mockResolvedValue(undefined);

      const result = await controller.searchUser('nonexistent@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('bookRoom', () => {
    it('should successfully book a room', async () => {
      const bookingData = { roomId: 'room-1', userId: '1' };
      const mockResponse = {
        success: true,
        room: { id: 'room-1', available: false, bookedBy: '1' },
        discount: 0.1,
        previousBookings: 2,
      };
      mockECommerceService.bookRoom.mockResolvedValue(mockResponse);

      const result = await controller.bookRoom(bookingData);

      expect(service.bookRoom).toHaveBeenCalledWith('room-1', '1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle room not found error', async () => {
      const bookingData = { roomId: 'invalid-room', userId: '1' };
      mockECommerceService.bookRoom.mockRejectedValue(new Error('Room not found'));

      await expect(controller.bookRoom(bookingData)).rejects.toThrow('Room not found');
    });

    it('should handle room not available error', async () => {
      const bookingData = { roomId: 'room-1', userId: '1' };
      mockECommerceService.bookRoom.mockRejectedValue(new Error('Room not available'));

      await expect(controller.bookRoom(bookingData)).rejects.toThrow('Room not available');
    });
  });

  describe('calculateOrder', () => {
    it('should calculate order total correctly', async () => {
      const orderData = {
        items: [
          { price: 100, quantity: 2 },
          { price: 50, quantity: 1 },
        ],
        userId: '1',
      };
      const mockResponse = { total: 225, itemCount: 2 };
      mockECommerceService.calculateOrderTotal.mockResolvedValue(mockResponse);

      const result = await controller.calculateOrder(orderData);

      expect(service.calculateOrderTotal).toHaveBeenCalledWith(orderData.items, '1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty items array', async () => {
      const orderData = { items: [], userId: '1' };
      const mockResponse = { total: 0, itemCount: 0 };
      mockECommerceService.calculateOrderTotal.mockResolvedValue(mockResponse);

      const result = await controller.calculateOrder(orderData);

      expect(result.total).toBe(0);
      expect(result.itemCount).toBe(0);
    });
  });

  describe('sortProducts', () => {
    it('should sort products with default limit', async () => {
      const mockResponse = {
        count: 10000,
        products: [
          { id: 'product-1', name: 'Product 1', price: 10 },
          { id: 'product-2', name: 'Product 2', price: 20 },
        ],
      };
      mockECommerceService.sortProducts.mockResolvedValue(mockResponse);

      const result = await controller.sortProducts('');

      expect(service.sortProducts).toHaveBeenCalledWith(10000);
      expect(result).toEqual(mockResponse);
    });

    it('should sort products with custom limit', async () => {
      const mockResponse = {
        count: 5000,
        products: [{ id: 'product-1', name: 'Product 1', price: 10 }],
      };
      mockECommerceService.sortProducts.mockResolvedValue(mockResponse);

      const result = await controller.sortProducts('5000');

      expect(service.sortProducts).toHaveBeenCalledWith(5000);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const query = 'laptop';
      const mockResponse = {
        count: 5,
        results: [
          { id: 'product-1', name: 'Laptop Pro', price: 1000, totalSold: 100, revenue: 100000 },
          { id: 'product-2', name: 'Gaming Laptop', price: 1500, totalSold: 50, revenue: 75000 },
        ],
      };
      mockECommerceService.searchProducts.mockResolvedValue(mockResponse);

      const result = await controller.searchProducts(query);

      expect(service.searchProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty search query', async () => {
      const mockResponse = { count: 30000, results: [] };
      mockECommerceService.searchProducts.mockResolvedValue(mockResponse);

      const result = await controller.searchProducts('');

      expect(service.searchProducts).toHaveBeenCalledWith('');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPostsWithAuthors', () => {
    it('should get posts with their authors', async () => {
      const ids = 'post-1,post-2,post-3';
      const mockResponse = {
        count: 3,
        posts: [
          {
            id: 'post-1',
            title: 'Post 1',
            author: { id: 'author-1', name: 'Author 1', totalPosts: 50 },
          },
          {
            id: 'post-2',
            title: 'Post 2',
            author: { id: 'author-2', name: 'Author 2', totalPosts: 30 },
          },
        ],
      };
      mockECommerceService.getPostsWithAuthors.mockResolvedValue(mockResponse);

      const result = await controller.getPostsWithAuthors(ids);

      expect(service.getPostsWithAuthors).toHaveBeenCalledWith(['post-1', 'post-2', 'post-3']);
      expect(result).toEqual(mockResponse);
    });

    it('should handle single post id', async () => {
      const ids = 'post-1';
      const mockResponse = {
        count: 1,
        posts: [
          {
            id: 'post-1',
            title: 'Post 1',
            author: { id: 'author-1', name: 'Author 1', totalPosts: 50 },
          },
        ],
      };
      mockECommerceService.getPostsWithAuthors.mockResolvedValue(mockResponse);

      const result = await controller.getPostsWithAuthors(ids);

      expect(service.getPostsWithAuthors).toHaveBeenCalledWith(['post-1']);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('processOrders', () => {
    it('should process orders and return summaries', async () => {
      const mockResponse = {
        count: 10,
        orders: [
          { id: 'order-1', total: 1500, userName: 'User 1' },
          { id: 'order-2', total: 2000, userName: 'User 2' },
        ],
      };
      mockECommerceService.processOrders.mockResolvedValue(mockResponse);

      const result = await controller.processOrders();

      expect(service.processOrders).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateRegistration', () => {
    it('should validate registration data successfully', async () => {
      const formData = {
        email: 'new@example.com',
        password: 'SecurePass123',
        phone: '123456789',
        address: '123 Main Street',
        zipCode: '12-345',
        city: 'Warsaw',
      };
      const mockResponse = { valid: true, errors: {} };
      mockECommerceService.validateRegistration.mockResolvedValue(mockResponse);

      const result = await controller.validateRegistration(formData);

      expect(service.validateRegistration).toHaveBeenCalledWith(formData);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return validation errors for invalid data', async () => {
      const formData = {
        email: 'invalid-email',
        password: 'short',
        phone: 'invalid',
        address: 'short',
        zipCode: 'wrong',
        city: 'AB',
      };
      const mockResponse = {
        valid: false,
        errors: {
          email: 'Invalid email format',
          password: 'Weak password',
          phone: 'Invalid phone',
          address: 'Invalid address',
          zipCode: 'Invalid zip code',
          city: 'Invalid city',
        },
      };
      mockECommerceService.validateRegistration.mockResolvedValue(mockResponse);

      const result = await controller.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('calculateRevenue', () => {
    it('should calculate revenue for specified days', async () => {
      const days = '30';
      const mockResponse = {
        days: 30,
        totalRevenue: 50000,
        orderCount: 100,
      };
      mockECommerceService.calculateRevenue.mockResolvedValue(mockResponse);

      const result = await controller.calculateRevenue(days);

      expect(service.calculateRevenue).toHaveBeenCalledWith(30);
      expect(result).toEqual(mockResponse);
    });

    it('should use default 365 days when not specified', async () => {
      const mockResponse = {
        days: 365,
        totalRevenue: 500000,
        orderCount: 1000,
      };
      mockECommerceService.calculateRevenue.mockResolvedValue(mockResponse);

      const result = await controller.calculateRevenue('');

      expect(service.calculateRevenue).toHaveBeenCalledWith(365);
      expect(result.days).toBe(365);
    });
  });

  describe('seedDatabase', () => {
    it('should seed database successfully', async () => {
      const mockResponse = {
        message: 'Database seeded successfully',
        counts: {
          users: 100000,
          posts: 50000,
          authors: 1000,
          products: 30000,
          orders: 100000,
          rooms: 5,
        },
      };
      mockECommerceService.seedDatabase.mockResolvedValue(mockResponse);

      const result = await controller.seedDatabase();

      expect(service.seedDatabase).toHaveBeenCalled();
      expect(result.message).toBe('Database seeded successfully');
      expect(result.counts).toBeDefined();
    });

    it('should handle already seeded database', async () => {
      const mockResponse = {
        message: 'Database already seeded',
        userCount: 100000,
      };
      mockECommerceService.seedDatabase.mockResolvedValue(mockResponse);

      const result = await controller.seedDatabase();

      expect(result.message).toBe('Database already seeded');
    });
  });
});
