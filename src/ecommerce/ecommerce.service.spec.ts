import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ECommerceService } from './ecommerce.service';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Author } from './entities/author.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { Room } from './entities/room.entity';

describe('ECommerceService', () => {
  let service: ECommerceService;
  let userRepository: Repository<User>;
  let postRepository: Repository<Post>;
  let authorRepository: Repository<Author>;
  let orderRepository: Repository<Order>;
  let productRepository: Repository<Product>;
  let roomRepository: Repository<Room>;

  const mockUserRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPostRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAuthorRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOrderRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProductRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockRoomRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ECommerceService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(Author),
          useValue: mockAuthorRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
      ],
    }).compile();

    service = module.get<ECommerceService>(ECommerceService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    authorRepository = module.get<Repository<Author>>(getRepositoryToken(Author));
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDatabase', () => {
    it('should return message when database already seeded', async () => {
      mockUserRepository.count.mockResolvedValue(100000);

      const result = await service.seedDatabase();

      expect(result.message).toBe('Database already seeded');
      expect(result.userCount).toBe(100000);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should seed database when empty', async () => {
      mockUserRepository.count.mockResolvedValue(0);
      mockUserRepository.save.mockResolvedValue([]);
      mockAuthorRepository.save.mockResolvedValue([]);
      mockPostRepository.save.mockResolvedValue([]);
      mockProductRepository.save.mockResolvedValue([]);
      mockOrderRepository.save.mockResolvedValue([]);
      mockRoomRepository.save.mockResolvedValue([]);
      
      // Mock count methods for final counts
      mockUserRepository.count.mockResolvedValueOnce(0); // initial check
      mockUserRepository.count.mockResolvedValueOnce(100000); // final count
      mockPostRepository.count.mockResolvedValue(50000);
      mockAuthorRepository.count.mockResolvedValue(1000);
      mockProductRepository.count.mockResolvedValue(30000);
      mockOrderRepository.count.mockResolvedValue(100000);
      mockRoomRepository.count.mockResolvedValue(5);

      const result = await service.seedDatabase();

      expect(result.message).toBe('Database seeded successfully');
      expect(result.counts).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockAuthorRepository.save).toHaveBeenCalled();
      expect(mockPostRepository.save).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
      expect(mockRoomRepository.save).toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const users = [
        { id: 1, email: 'user1@example.com', name: 'User 1', tier: 'gold', phone: '123456789' },
        { id: 2, email: 'user2@example.com', name: 'User 2', tier: 'silver', phone: '987654321' },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findUserByEmail('user1@example.com');

      expect(result).toEqual(users[0]);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should return undefined when user not found', async () => {
      const users = [
        { id: 1, email: 'user1@example.com', name: 'User 1', tier: 'gold', phone: '123456789' },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findUserByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });

    it('should handle empty user list', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findUserByEmail('any@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('bookRoom', () => {
    it('should successfully book an available room', async () => {
      const room = { id: 'room-1', available: true, bookedBy: null };
      const user = { id: 1, email: 'user@example.com', name: 'Test User', tier: 'gold', phone: '123456789' };
      const allRooms = [room];
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(room),
      };
      
      mockRoomRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockUserRepository.find.mockResolvedValue([user]);
      mockRoomRepository.find.mockResolvedValue(allRooms);
      mockRoomRepository.save.mockResolvedValue({ ...room, available: false, bookedBy: '1' });

      const result = await service.bookRoom('room-1', '1');

      expect(result.success).toBe(true);
      expect(result.discount).toBe(0.15); // gold tier discount
      expect(mockRoomRepository.save).toHaveBeenCalled();
    });

    it('should throw error when room not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      
      mockRoomRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.bookRoom('invalid-room', '1')).rejects.toThrow('Room not found');
    });

    it('should throw error when room not available', async () => {
      const room = { id: 'room-1', available: false, bookedBy: '2' };
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(room),
      };
      
      mockRoomRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.bookRoom('room-1', '1')).rejects.toThrow('Room not available');
    });

    it('should throw error when user not found', async () => {
      const room = { id: 'room-1', available: true, bookedBy: null };
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(room),
      };
      
      mockRoomRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockUserRepository.find.mockResolvedValue([]);

      await expect(service.bookRoom('room-1', '999')).rejects.toThrow('User not found');
    });

    it('should handle different user tiers correctly', async () => {
      const room = { id: 'room-1', available: true, bookedBy: null };
      const bronzeUser = { id: 1, email: 'user@example.com', name: 'Test User', tier: 'bronze', phone: '123456789' };
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(room),
      };
      
      mockRoomRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockUserRepository.find.mockResolvedValue([bronzeUser]);
      mockRoomRepository.find.mockResolvedValue([room]);
      mockRoomRepository.save.mockResolvedValue({ ...room, available: false, bookedBy: '1' });

      const result = await service.bookRoom('room-1', '1');

      expect(result.discount).toBe(0.05); // bronze tier discount
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate order total with user discount', async () => {
      const items = [
        { price: 100, quantity: 1 },
        { price: 200, quantity: 1 },
      ];
      const user = { id: 1, email: 'user@example.com', name: 'Test User', tier: 'silver', phone: '123456789' };
      
      mockUserRepository.find.mockResolvedValue([user]);

      const result = await service.calculateOrderTotal(items, '1');

      expect(result.total).toBeLessThan(300); // with discount
      expect(result.itemCount).toBe(2);
      // After optimization, user lookup should only happen once
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle empty items array', async () => {
      const user = { id: 1, email: 'user@example.com', name: 'Test User', tier: 'silver', phone: '123456789' };
      mockUserRepository.find.mockResolvedValue([user]);

      const result = await service.calculateOrderTotal([], '1');

      expect(result.total).toBe(0);
      expect(result.itemCount).toBe(0);
    });

    it('should return error when user not found', async () => {
      const items = [
        { price: 100, quantity: 1 },
        { price: 200, quantity: 1 },
      ];
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.calculateOrderTotal(items, '999');

      expect(result.total).toBe(0);
      expect(result.itemCount).toBe(2);
      expect(result.error).toBe('User not found');
    });
  });

  describe('sortProducts', () => {
    it('should sort products by price', async () => {
      const products = [
        { id: 'product-1', name: 'Product 1', price: 300, category: 'cat-1', stock: 10, description: 'Desc 1' },
        { id: 'product-2', name: 'Product 2', price: 100, category: 'cat-2', stock: 20, description: 'Desc 2' },
        { id: 'product-3', name: 'Product 3', price: 200, category: 'cat-3', stock: 30, description: 'Desc 3' },
      ];
      
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.sortProducts(10);

      expect(result.count).toBe(3);
      expect(result.products[0].price).toBeLessThanOrEqual(result.products[1].price);
      expect(mockProductRepository.find).toHaveBeenCalled();
    });

    it('should handle empty product list', async () => {
      mockProductRepository.find.mockResolvedValue([]);

      const result = await service.sortProducts(10);

      expect(result.count).toBe(0);
      expect(result.products).toEqual([]);
    });

    it('should limit returned products to 20', async () => {
      const products = Array.from({ length: 50 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        price: Math.random() * 1000,
        category: 'cat-1',
        stock: 10,
        description: 'Description',
      }));
      
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.sortProducts(50);

      expect(result.products.length).toBeLessThanOrEqual(20);
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', async () => {
      const products = [
        { id: 'product-1', name: 'Laptop', price: 1000, category: 'cat-1', stock: 10, description: 'A laptop' },
        { id: 'product-2', name: 'Mouse', price: 50, category: 'cat-2', stock: 100, description: 'A mouse' },
        { id: 'product-3', name: 'Gaming Laptop', price: 1500, category: 'cat-3', stock: 5, description: 'Gaming laptop' },
      ];
      const orders = [
        { id: 'order-1', userId: '1', status: 'completed', total: 1000, items: JSON.stringify([{ productId: 'product-1', quantity: 1, price: 1000 }]), createdAt: new Date() },
      ];
      
      mockProductRepository.find.mockResolvedValue(products);
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.searchProducts('laptop');

      expect(result.count).toBeGreaterThan(0);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].totalSold).toBeDefined();
      expect(result.results[0].revenue).toBeDefined();
    });

    it('should search products by description', async () => {
      const products = [
        { id: 'product-1', name: 'Device A', price: 1000, category: 'cat-1', stock: 10, description: 'Contains laptop features' },
        { id: 'product-2', name: 'Device B', price: 50, category: 'cat-2', stock: 100, description: 'Simple mouse' },
      ];
      const orders = [];
      
      mockProductRepository.find.mockResolvedValue(products);
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.searchProducts('laptop');

      expect(result.count).toBeGreaterThan(0);
    });

    it('should handle empty query', async () => {
      const products = [
        { id: 'product-1', name: 'Product 1', price: 100, category: 'cat-1', stock: 10, description: 'Desc 1' },
      ];
      const orders = [];
      
      mockProductRepository.find.mockResolvedValue(products);
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.searchProducts('');

      expect(result.count).toBe(products.length);
    });

    it('should limit results to 100', async () => {
      const products = Array.from({ length: 200 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        price: 100,
        category: 'cat-1',
        stock: 10,
        description: 'Description',
      }));
      const orders = [];
      
      mockProductRepository.find.mockResolvedValue(products);
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.searchProducts('product');

      expect(result.results.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getPostsWithAuthors', () => {
    it('should get posts with their authors', async () => {
      const post = { id: 'post-1', title: 'Post 1', authorId: 'author-1', content: 'Content', views: 100, createdAt: new Date() };
      const author = { id: 'author-1', name: 'Author 1', email: 'author@example.com', bio: 'Bio' };
      
      const postQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(post),
        getCount: jest.fn().mockResolvedValue(10),
      };
      
      const authorQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(author),
      };
      
      mockPostRepository.createQueryBuilder
        .mockReturnValueOnce(postQueryBuilder)
        .mockReturnValueOnce(postQueryBuilder);
      mockAuthorRepository.createQueryBuilder.mockReturnValue(authorQueryBuilder);

      const result = await service.getPostsWithAuthors(['post-1']);

      expect(result.count).toBe(1);
      expect(result.posts[0].author).toBeDefined();
      expect(result.posts[0].author.totalPosts).toBe(10);
    });

    it('should handle posts without authors', async () => {
      const post = { id: 'post-1', title: 'Post 1', authorId: 'author-1', content: 'Content', views: 100, createdAt: new Date() };
      
      const postQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(post),
        getCount: jest.fn().mockResolvedValue(0),
      };
      
      const authorQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      
      mockPostRepository.createQueryBuilder
        .mockReturnValueOnce(postQueryBuilder)
        .mockReturnValueOnce(postQueryBuilder);
      mockAuthorRepository.createQueryBuilder.mockReturnValue(authorQueryBuilder);

      const result = await service.getPostsWithAuthors(['post-1']);

      expect(result.posts[0].author).toBeNull();
    });

    it('should handle non-existent posts', async () => {
      const postQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      
      mockPostRepository.createQueryBuilder.mockReturnValue(postQueryBuilder);

      const result = await service.getPostsWithAuthors(['invalid-post']);

      expect(result.count).toBe(0);
      expect(result.posts).toEqual([]);
    });

    it('should handle multiple posts', async () => {
      const posts = [
        { id: 'post-1', title: 'Post 1', authorId: 'author-1', content: 'Content 1', views: 100, createdAt: new Date() },
        { id: 'post-2', title: 'Post 2', authorId: 'author-2', content: 'Content 2', views: 200, createdAt: new Date() },
      ];
      const authors = [
        { id: 'author-1', name: 'Author 1', email: 'author1@example.com', bio: 'Bio 1' },
        { id: 'author-2', name: 'Author 2', email: 'author2@example.com', bio: 'Bio 2' },
      ];
      
      const postQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn()
          .mockResolvedValueOnce(posts[0])
          .mockResolvedValueOnce(posts[1]),
        getCount: jest.fn().mockResolvedValue(5),
      };
      
      const authorQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn()
          .mockResolvedValueOnce(authors[0])
          .mockResolvedValueOnce(authors[1]),
      };
      
      mockPostRepository.createQueryBuilder.mockReturnValue(postQueryBuilder);
      mockAuthorRepository.createQueryBuilder.mockReturnValue(authorQueryBuilder);

      const result = await service.getPostsWithAuthors(['post-1', 'post-2']);

      expect(result.count).toBe(2);
    });
  });

  describe('processOrders', () => {
    it('should process high value active orders', async () => {
      const orders = [
        { id: 'order-1', userId: '1', status: 'active', total: 1500, items: '[]', createdAt: new Date() },
        { id: 'order-2', userId: '2', status: 'active', total: 2000, items: '[]', createdAt: new Date() },
        { id: 'order-3', userId: '3', status: 'completed', total: 500, items: '[]', createdAt: new Date() },
      ];
      const users = [
        { id: 1, email: 'user1@example.com', name: 'User 1', tier: 'gold', phone: '123456789' },
        { id: 2, email: 'user2@example.com', name: 'User 2', tier: 'silver', phone: '987654321' },
      ];
      
      mockOrderRepository.find.mockResolvedValue(orders);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.processOrders();

      expect(result.count).toBe(2);
      expect(result.orders.length).toBeLessThanOrEqual(20);
    });

    it('should handle empty orders', async () => {
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.processOrders();

      expect(result.count).toBe(0);
      expect(result.orders).toEqual([]);
    });

    it('should handle orders without users', async () => {
      const orders = [
        { id: 'order-1', userId: '999', status: 'active', total: 1500, items: '[]', createdAt: new Date() },
      ];
      
      mockOrderRepository.find.mockResolvedValue(orders);
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.processOrders();

      expect(result.orders[0].userName).toBe('Unknown');
    });
  });

  describe('validateRegistration', () => {
    it('should validate correct registration data', async () => {
      const formData = {
        email: 'new@example.com',
        password: 'SecurePass123',
        phone: '123456789',
        address: '123 Main Street, Apt 4B',
        zipCode: '12-345',
        city: 'Warsaw',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should detect existing email', async () => {
      const formData = {
        email: 'existing@example.com',
        password: 'SecurePass123',
        phone: '123456789',
        address: '123 Main Street',
        zipCode: '12-345',
        city: 'Warsaw',
      };
      const existingUser = { id: 1, email: 'existing@example.com', name: 'Existing User', tier: 'gold', phone: '999999999' };
      
      mockUserRepository.find.mockResolvedValue([existingUser]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should detect invalid email format', async () => {
      const formData = {
        email: 'invalid-email',
        password: 'SecurePass123',
        phone: '123456789',
        address: '123 Main Street',
        zipCode: '12-345',
        city: 'Warsaw',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should detect weak password', async () => {
      const formData = {
        email: 'new@example.com',
        password: 'short',
        phone: '123456789',
        address: '123 Main Street',
        zipCode: '12-345',
        city: 'Warsaw',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should detect invalid phone format', async () => {
      const formData = {
        email: 'new@example.com',
        password: 'SecurePass123',
        phone: '12345',
        address: '123 Main Street',
        zipCode: '12-345',
        city: 'Warsaw',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('should detect invalid address', async () => {
      const formData = {
        email: 'new@example.com',
        password: 'SecurePass123',
        phone: '123456789',
        address: 'short',
        zipCode: '12-345',
        city: 'Warsaw',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.address).toBeDefined();
    });

    it('should detect invalid zip code', async () => {
      const formData = {
        email: 'new@example.com',
        password: 'SecurePass123',
        phone: '123456789',
        address: '123 Main Street',
        zipCode: 'invalid',
        city: 'Warsaw',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.zipCode).toBeDefined();
    });

    it('should detect invalid city', async () => {
      const formData = {
        email: 'new@example.com',
        password: 'SecurePass123',
        phone: '123456789',
        address: '123 Main Street',
        zipCode: '12-345',
        city: 'AB',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.city).toBeDefined();
    });

    it('should detect multiple validation errors', async () => {
      const formData = {
        email: 'invalid',
        password: 'short',
        phone: '123',
        address: 'bad',
        zipCode: 'bad',
        city: 'AB',
      };
      
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.validateRegistration(formData);

      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(1);
    });
  });

  describe('calculateRevenue', () => {
    it('should calculate revenue for specified period', async () => {
      const orders = [
        {
          id: 'order-1',
          userId: '1',
          status: 'completed',
          total: 1000,
          items: JSON.stringify([{ productId: 'product-1', quantity: 2, price: 500 }]),
          createdAt: new Date(),
        },
      ];
      const products = [
        { id: 'product-1', name: 'Product 1', price: 500, category: 'cat-1', stock: 10, description: 'Desc' },
      ];
      
      const orderQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(orders),
      };
      
      mockOrderRepository.createQueryBuilder.mockReturnValue(orderQueryBuilder);
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.calculateRevenue(30);

      expect(result.days).toBe(30);
      expect(result.totalRevenue).toBeGreaterThan(0);
      expect(result.orderCount).toBe(1);
    });

    it('should handle orders with no items', async () => {
      const orders = [
        {
          id: 'order-1',
          userId: '1',
          status: 'completed',
          total: 0,
          items: JSON.stringify([]),
          createdAt: new Date(),
        },
      ];
      
      const orderQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(orders),
      };
      
      mockOrderRepository.createQueryBuilder.mockReturnValue(orderQueryBuilder);

      const result = await service.calculateRevenue(30);

      expect(result.totalRevenue).toBe(0);
    });

    it('should handle no orders in period', async () => {
      const orderQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      
      mockOrderRepository.createQueryBuilder.mockReturnValue(orderQueryBuilder);

      const result = await service.calculateRevenue(30);

      expect(result.totalRevenue).toBe(0);
      expect(result.orderCount).toBe(0);
    });

    it('should handle products not found', async () => {
      const orders = [
        {
          id: 'order-1',
          userId: '1',
          status: 'completed',
          total: 1000,
          items: JSON.stringify([{ productId: 'product-999', quantity: 2, price: 500 }]),
          createdAt: new Date(),
        },
      ];
      
      const orderQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(orders),
      };
      
      mockOrderRepository.createQueryBuilder.mockReturnValue(orderQueryBuilder);
      mockProductRepository.find.mockResolvedValue([]);

      const result = await service.calculateRevenue(30);

      expect(result.totalRevenue).toBe(0);
    });
  });
});
