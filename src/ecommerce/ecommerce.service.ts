import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Author } from './entities/author.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { Room } from './entities/room.entity';

@Injectable()
export class ECommerceService {
  private globalLock: boolean = false;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  // ==========================================
  // Seed database with test data
  // ==========================================
  async seedDatabase(): Promise<any> {
    const userCount = await this.userRepository.count();
    
    if (userCount > 0) {
      return { message: 'Database already seeded', userCount };
    }

    console.log('Starting database seeding...');
    const BATCH_SIZE = 100; // SQLite limit ~999 variables, safe batch size

    // Seed users (100,000)
    console.log('Seeding users...');
    for (let i = 1; i <= 100000; i += BATCH_SIZE) {
      const users: any[] = [];
      for (let j = i; j < i + BATCH_SIZE && j <= 100000; j++) {
        users.push({
          email: `user${j}@example.com`,
          name: `User ${j}`,
          tier: ['bronze', 'silver', 'gold', 'platinum'][j % 4],
          phone: `${100000000 + j}`,
        });
      }
      await this.userRepository.save(users);
      
      if (i % 10000 === 0) {
        console.log(`  ${i} users seeded...`);
      }
    }
    console.log('Users seeding completed!');

    // Seed authors (1,000)
    console.log('Seeding authors...');
    for (let i = 1; i <= 1000; i += BATCH_SIZE) {
      const authors: any[] = [];
      for (let j = i; j < i + BATCH_SIZE && j <= 1000; j++) {
        authors.push({
          id: `author-${j}`,
          name: `Author ${j}`,
          email: `author${j}@example.com`,
          bio: `Bio for author ${j}`.repeat(10),
        });
      }
      await this.authorRepository.save(authors);
    }
    console.log('Authors seeding completed!');

    // Seed posts (50,000)
    console.log('Seeding posts...');
    for (let i = 1; i <= 50000; i += BATCH_SIZE) {
      const posts: any[] = [];
      for (let j = i; j < i + BATCH_SIZE && j <= 50000; j++) {
        posts.push({
          id: `post-${j}`,
          title: `Post ${j}`,
          authorId: `author-${(j % 1000) + 1}`,
          content: `Content of post ${j}`.repeat(20),
          views: Math.floor(Math.random() * 10000),
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        });
      }
      await this.postRepository.save(posts);
      
      if (i % 10000 === 0) {
        console.log(`  ${i} posts seeded...`);
      }
    }
    console.log('Posts seeding completed!');

    // Seed products (30,000)
    console.log('Seeding products...');
    for (let i = 1; i <= 30000; i += BATCH_SIZE) {
      const products: any[] = [];
      for (let j = i; j < i + BATCH_SIZE && j <= 30000; j++) {
        products.push({
          id: `product-${j}`,
          name: `Product ${j}`,
          price: Math.random() * 1000,
          category: `category-${(j % 100) + 1}`,
          stock: Math.floor(Math.random() * 1000),
          description: `Description for product ${j}`.repeat(5),
        });
      }
      await this.productRepository.save(products);
      
      if (i % 10000 === 0) {
        console.log(`  ${i} products seeded...`);
      }
    }
    console.log('Products seeding completed!');

    // Seed orders (100,000)
    console.log('Seeding orders...');
    for (let i = 1; i <= 100000; i += BATCH_SIZE) {
      const orders: any[] = [];
      for (let j = i; j < i + BATCH_SIZE && j <= 100000; j++) {
        const items = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, k) => ({
          productId: `product-${k + 1}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: Math.random() * 100,
        }));
        
        orders.push({
          id: `order-${j}`,
          userId: `${(j % 10000) + 1}`,
          status: j % 3 === 0 ? 'active' : 'completed',
          total: Math.random() * 5000,
          items: JSON.stringify(items),
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        });
      }
      await this.orderRepository.save(orders);
      
      if (i % 10000 === 0) {
        console.log(`  ${i} orders seeded...`);
      }
    }
    console.log('Orders seeding completed!');

    // Seed rooms
    console.log('Seeding rooms...');
    const rooms = [
      { id: 'room-1', available: true, bookedBy: null },
      { id: 'room-2', available: true, bookedBy: null },
      { id: 'room-3', available: true, bookedBy: null },
      { id: 'room-4', available: true, bookedBy: null },
      { id: 'room-5', available: true, bookedBy: null },
    ];
    await this.roomRepository.save(rooms as any[]);
    console.log('Rooms seeding completed!');

    const counts = {
      users: await this.userRepository.count(),
      posts: await this.postRepository.count(),
      authors: await this.authorRepository.count(),
      products: await this.productRepository.count(),
      orders: await this.orderRepository.count(),
      rooms: await this.roomRepository.count(),
    };

    console.log('Database seeding completed!', counts);

    return {
      message: 'Database seeded successfully',
      counts,
    };
  }

  // ==========================================
  // 1. IDS - Brak indeksu na email
  // Query scan całej tabeli users (100,000 rekordów)
  // ==========================================
  async findUserByEmail(email: string): Promise<User | undefined> {
    // Używa find() zamiast findOne() - ładuje WSZYSTKICH użytkowników do pamięci
    const allUsers = await this.userRepository.find();
    return allUsers.find(u => u.email === email);
  }

  // ==========================================
  // 2. IS - Globalna blokada dla wszystkich pokoi
  // ==========================================
  async bookRoom(roomId: string, userId: string): Promise<any> {
    while (this.globalLock) {
      await new Promise(resolve => setImmediate(resolve));
    }
    
    this.globalLock = true;
    
    try {
      // Query bez indeksu - scan całej tabeli
      const room = await this.roomRepository
        .createQueryBuilder('room')
        .where('room.id = :roomId', { roomId })
        .getOne();

      if (!room) {
        throw new Error('Room not found');
      }

      if (!room.available) {
        throw new Error('Room not available');
      }

      // Ładuje WSZYSTKICH użytkowników do pamięci
      const allUsers = await this.userRepository.find();
      const user = allUsers.find(u => u.id === parseInt(userId));
      
      if (!user) {
        throw new Error('User not found');
      }

      // Sprawdza wszystkie rezerwacje użytkownika (scan całej tabeli)
      const allRooms = await this.roomRepository.find();
      const userBookings = allRooms.filter(r => r.bookedBy === userId);

      // Kolejny scan dla obliczenia rabatu
      const userForDiscount = allUsers.find(u => u.id === parseInt(userId));
      const discount = this.calculateDiscount(userForDiscount?.tier || 'bronze');

      room.available = false;
      room.bookedBy = userId;
      await this.roomRepository.save(room);

      return {
        success: true,
        room,
        discount,
        previousBookings: userBookings.length,
      };
    } finally {
      this.globalLock = false;
    }
  }

  private calculateDiscount(tier: string): number {
    const discounts = { bronze: 0.05, silver: 0.1, gold: 0.15, platinum: 0.2 };
    return discounts[tier] || 0;
  }

  // ==========================================
  // 3. RC - Powtarzane query dla tego samego użytkownika
  // FIXED: Fetch user once, calculate discount once, apply to all items
  // ==========================================
  async calculateOrderTotal(items: any[], userId: string): Promise<any> {
    // Fetch user once before processing items
    const allUsers = await this.userRepository.find();
    const user = allUsers.find(u => u.id === parseInt(userId));
    
    if (!user) {
      return { total: 0, itemCount: items.length, error: 'User not found' };
    }

    // Calculate discount once for the user
    const discount = this.calculateDiscount(user.tier || 'bronze');
    
    // Apply discount to all items without additional queries
    let total = 0;
    for (const item of items) {
      total += item.price * (1 - discount);
    }
    
    return { total, itemCount: items.length };
  }

  // ==========================================
  // 4. GIC - In-memory bubble sort
  // Ładuje wszystkie produkty do pamięci i sortuje O(n²)
  // ==========================================
  async sortProducts(limit: number = 10000): Promise<any> {
    // Ładuje WSZYSTKIE produkty bez limitu
    const products = await this.productRepository.find();
    
    // Bubble sort - O(n²)
    const n = Math.min(products.length, limit);
    const productsToSort = products.slice(0, n);
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (productsToSort[j].price > productsToSort[j + 1].price) {
          const temp = productsToSort[j];
          productsToSort[j] = productsToSort[j + 1];
          productsToSort[j + 1] = temp;
        }
      }
    }
    
    return {
      count: productsToSort.length,
      products: productsToSort.slice(0, 20),
    };
  }

  // ==========================================
  // 5. ISC - Brak optymalizacji dla edge cases
  // ==========================================
  async searchProducts(query: string): Promise<any> {
    // Ładuje WSZYSTKIE produkty do pamięci
    const allProducts = await this.productRepository.find();
    
    // Brak early return dla pustego query - przetwarza wszystko
    const results = allProducts.filter(p => {
      const searchText = query ? query.toLowerCase() : '';
      return p.name.toLowerCase().includes(searchText) || 
             p.description.toLowerCase().includes(searchText);
    });

    // Dla każdego produktu wykonuje agregację na ALL orders
    const enrichedResults: any[] = [];
    for (const product of results) {
      let totalSold = 0;
      let revenue = 0;
      
      // Ładuje WSZYSTKIE zamówienia dla każdego produktu
      const allOrders = await this.orderRepository.find();
      
      for (const order of allOrders) {
        const items = JSON.parse(order.items);
        for (const item of items) {
          if (item.productId === product.id) {
            totalSold += item.quantity;
            revenue += item.price * item.quantity;
          }
        }
      }

      enrichedResults.push({
        ...product,
        totalSold,
        revenue,
      });
    }
    
    return {
      count: enrichedResults.length,
      results: enrichedResults.slice(0, 100),
    };
  }

  // ==========================================
  // 6. IAU - N+1 Query Problem
  // ==========================================
  async getPostsWithAuthors(postIds: string[]): Promise<any> {
    const results: any[] = [];
    
    // N+1: dla każdego posta osobne query
    for (const id of postIds) {
      // Query 1: znajdź post (bez indeksu - table scan)
      const post = await this.postRepository
        .createQueryBuilder('post')
        .where('post.id = :id', { id })
        .getOne();
      
      if (post) {
        // Query 2: znajdź autora (bez indeksu - table scan)
        const author = await this.authorRepository
          .createQueryBuilder('author')
          .where('author.id = :authorId', { authorId: post.authorId })
          .getOne();
        
        // Query 3: policz wszystkie posty autora (full table scan)
        const authorPostCount = await this.postRepository
          .createQueryBuilder('post')
          .where('post.authorId = :authorId', { authorId: post.authorId })
          .getCount();
        
        results.push({ 
          ...post, 
          author: author ? {
            ...author,
            totalPosts: authorPostCount,
          } : null,
        });
      }
    }
    
    // Dla 10 postów = 30 osobnych queries (każdy ze scan)
    
    return {
      count: results.length,
      posts: results,
    };
  }

  // ==========================================
  // 7. II - Wielokrotne ładowanie tych samych danych
  // ==========================================
  async processOrders(): Promise<any> {
    // Pierwsze ładowanie: wszystkie zamówienia
    const allOrders1 = await this.orderRepository.find();
    const activeOrders = allOrders1.filter(o => o.status === 'active');
    
    // Drugie ładowanie: te same zamówienia ponownie
    const allOrders2 = await this.orderRepository.find();
    const activeOrders2 = allOrders2.filter(o => o.status === 'active');
    const highValueOrders = activeOrders2.filter(o => o.total > 1000);
    
    // Trzecie przetwarzanie: dla każdego zamówienia ładuje wszystkich użytkowników
    const orderSummaries: any[] = [];
    for (const order of highValueOrders) {
      // Dla KAŻDEGO zamówienia ładuje WSZYSTKICH użytkowników
      const allUsers = await this.userRepository.find();
      const user = allUsers.find(u => u.id === parseInt(order.userId));
      
      orderSummaries.push({
        id: order.id,
        total: order.total,
        userName: user ? user.name : 'Unknown',
      });
    }
    
    return {
      count: orderSummaries.length,
      orders: orderSummaries.slice(0, 20),
    };
  }

  // ==========================================
  // 8. RDP - Nadmiarowa walidacja
  // ==========================================
  async validateRegistration(formData: any): Promise<any> {
    const errors: any = {};
    
    // Ładuje WSZYSTKICH użytkowników do sprawdzenia email
    const allUsersForEmail = await this.userRepository.find();
    const emailExists = allUsersForEmail.find(u => u.email === formData.email);
    if (emailExists) {
      errors.email = 'Email already exists';
    }
    
    if (!this.isValidEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // NADAL waliduje hasło nawet jeśli email jest błędny
    if (!this.isValidPassword(formData.password)) {
      errors.password = 'Weak password';
    }
    
    // Ładuje WSZYSTKICH użytkowników PONOWNIE do sprawdzenia telefonu
    const allUsersForPhone = await this.userRepository.find();
    const phoneExists = allUsersForPhone.find(u => u.phone === formData.phone);
    if (phoneExists) {
      errors.phone = 'Phone already exists';
    }
    
    if (!this.isValidPhone(formData.phone)) {
      errors.phone = 'Invalid phone';
    }
    
    // Waliduje adres nawet jeśli email i hasło są błędne
    if (!this.isValidAddress(formData.address)) {
      errors.address = 'Invalid address';
    }
    
    // Agregacja na wszystkich użytkownikach
    const allUsersForZip = await this.userRepository.find();
    const zipCodeCount = allUsersForZip.filter(u => 
      u.name.includes(formData.zipCode)
    ).length;
    
    if (!this.isValidZipCode(formData.zipCode)) {
      errors.zipCode = 'Invalid zip code';
    }
    
    if (!this.isValidCity(formData.city)) {
      errors.city = 'Invalid city';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // ==========================================
  // Dodatkowa metoda: II + RC combined
  // ==========================================
  async calculateRevenue(days: number): Promise<any> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Ładuje wszystkie zamówienia
    const allOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :cutoffDate', { cutoffDate })
      .getMany();
    
    let totalRevenue = 0;
    
    for (const order of allOrders) {
      const items = JSON.parse(order.items);
      
      for (const item of items) {
        // Dla każdego produktu w każdym zamówieniu ładuje WSZYSTKIE produkty
        const allProducts = await this.productRepository.find();
        const product = allProducts.find(p => p.id === item.productId);
        
        if (product) {
          totalRevenue += item.quantity * product.price;
        }
      }
    }
    
    return {
      days,
      totalRevenue,
      orderCount: allOrders.length,
    };
  }

  private isValidEmail(email: string): boolean {
    if (email && email.includes('@') && email.includes('.')) {
      return true;
    }
    return false;
  }

  private isValidPassword(password: string): boolean {
    if (password && password.length >= 8) {
      return true;
    }
    return false;
  }

  private isValidPhone(phone: string): boolean {
    if (phone && /^\d{9}$/.test(phone)) {
      return true;
    }
    return false;
  }

  private isValidAddress(address: string): boolean {
    if (address && address.length > 10) {
      return true;
    }
    return false;
  }

  private isValidZipCode(zipCode: string): boolean {
    if (zipCode && /^\d{2}-\d{3}$/.test(zipCode)) {
      return true;
    }
    return false;
  }

  private isValidCity(city: string): boolean {
    if (city && city.length > 2) {
      return true;
    }
    return false;
  }
}
