import {
  users, factories, categories, products, reviews, orders, orderItems,
  type User, type UpsertUser, type Factory, type Category, type Product, type Review, type Order, type OrderItem,
  type CreateReviewRequest, type CreateOrderRequest, type ProductWithDetails, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users (Auth handled by Replit Auth, but we might need these)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;

  // Factories
  getFactories(): Promise<Factory[]>;
  getFactory(id: number): Promise<Factory | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;

  // Products
  getProducts(filters?: { category?: string; search?: string; sort?: string }): Promise<ProductWithDetails[]>;
  getProduct(id: number): Promise<ProductWithDetails | undefined>;

  // Reviews
  getReviews(productId: number): Promise<(Review & { user: { username: string } })[]>;
  createReview(userId: string, productId: number, review: CreateReviewRequest): Promise<Review>;

  // Orders
  createOrder(userId: string, items: { productId: number; quantity: number }[], paymentMethod: string): Promise<Order>;
  getOrders(userId: string): Promise<OrderWithItems[]>;
  updateOrderStatus(orderId: number, status: string): Promise<Order>;

  // Vendor Management
  updateUserRole(userId: string, role: string): Promise<void>;
  createProduct(vendorId: string, productData: any): Promise<Product>;
  updateProduct(vendorId: string, productId: number, productData: any): Promise<Product>;
  getVendorProducts(vendorId: string): Promise<Product[]>;
  getAllUsers(): Promise<User[]>;
  getAllOrders(): Promise<OrderWithItems[]>;
  deleteUser(id: string): Promise<void>;
  deleteProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Factories
  async getFactories(): Promise<Factory[]> {
    return await db.select().from(factories);
  }

  async getFactory(id: number): Promise<Factory | undefined> {
    const [factory] = await db.select().from(factories).where(eq(factories.id, id));
    return factory;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  // Products
  async getProducts(filters?: { category?: string; search?: string; sort?: string }): Promise<ProductWithDetails[]> {
    let query = db.select({
      product: products,
      factory: factories,
      category: categories,
    })
      .from(products)
      .leftJoin(factories, eq(products.factoryId, factories.id))
      .innerJoin(categories, eq(products.categoryId, categories.id));

    if (filters?.category) {
      const catId = parseInt(filters.category);
      if (!isNaN(catId)) {
        query.where(eq(products.categoryId, catId));
      }
    }

    if (filters?.search) {
      query.where(sql`(${products.nameEn} ILIKE ${`%${filters.search}%`} OR ${products.nameAr} ILIKE ${`%${filters.search}%`})`);
    }

    if (filters?.sort) {
      if (filters.sort === 'price_asc') query.orderBy(products.price);
      else if (filters.sort === 'price_desc') query.orderBy(desc(products.price));
      else if (filters.sort === 'newest') query.orderBy(desc(products.id));
    }

    const results = await query;
    return results.map(r => ({
      ...r.product,
      factory: r.factory || null,
      category: r.category,
    })) as ProductWithDetails[];
  }

  async getProduct(id: number): Promise<ProductWithDetails | undefined> {
    const [result] = await db.select({
      product: products,
      factory: factories,
      category: categories,
    })
      .from(products)
      .leftJoin(factories, eq(products.factoryId, factories.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (!result) return undefined;

    return {
      ...result.product,
      factory: result.factory || null,
      category: result.category,
    } as ProductWithDetails;
  }

  // Reviews
  async getReviews(productId: number): Promise<(Review & { user: { username: string } })[]> {
    const results = await db.select({
      review: reviews,
      user: {
        username: users.email,
      }
    })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return results.map(r => ({ ...r.review, user: { username: r.user.username?.split('@')[0] || 'Anonymous' } }));
  }

  async createReview(userId: string, productId: number, review: { rating: number; comment?: string | null }): Promise<Review> {
    const [newReview] = await db.insert(reviews).values({
      userId,
      productId,
      ...review
    }).returning();
    return newReview;
  }

  // Orders
  async createOrder(userId: string, items: { productId: number; quantity: number }[], paymentMethod: string): Promise<Order> {
    // MOQ: 30 items total
    const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    if (totalQuantity < 30) {
      throw new Error("A minimum of 30 items is required to place an order");
    }

    return await db.transaction(async (tx: any) => {
      let total = 0;
      const orderItemsData = [];

      for (const item of items) {
        // Atomic stock check and decrement
        const [product] = await tx.select()
          .from(products)
          .where(eq(products.id, item.productId))
          .for('update'); // Lock the row for the transaction

        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.nameEn}`);
        }

        const price = Number(product.price);
        total += price * item.quantity;

        // Decrement stock
        await tx.update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, item.productId));

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }

      // Create order
      const [order] = await tx.insert(orders).values({
        userId,
        total: total.toString(),
        status: "pending",
        paymentMethod
      }).returning();

      // Create order items
      for (const itemData of orderItemsData) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          price: itemData.price
        });
      }

      return order;
    });
  }

  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(userOrders.map(async (order) => {
      const items = await db.select({
        orderItem: orderItems,
        product: products
      })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        items: items.map(i => ({ ...i.orderItem, product: i.product }))
      };
    }));

    return ordersWithItems as OrderWithItems[];
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    console.log(`[Storage] Updating order ${orderId} to status ${status}`);
    try {
      const [order] = await db.update(orders)
        .set({ status })
        .where(eq(orders.id, orderId))
        .returning();
      if (!order) {
        console.error(`[Storage] Order ${orderId} not found`);
        throw new Error("Order not found");
      }
      return order;
    } catch (err: any) {
      console.error(`[Storage] Database error updating order ${orderId}:`, err);
      throw err;
    }
  }

  // Vendor Management
  async updateUserRole(userId: string, role: string): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, userId));
  }

  async createProduct(vendorId: string, productData: any): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...productData,
      vendorId,
    }).returning();
    return product;
  }

  async updateProduct(vendorId: string, productId: number, productData: any): Promise<Product> {
    const [product] = await db.update(products)
      .set(productData)
      .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)))
      .returning();
    if (!product) throw new Error("Product not found or unauthorized");
    return product;
  }

  async getVendorProducts(vendorId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.vendorId, vendorId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(allOrders.map(async (order) => {
      const items = await db.select({
        orderItem: orderItems,
        product: products
      })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      const [user] = await db.select().from(users).where(eq(users.id, order.userId));

      return {
        ...order,
        user,
        items: items.map(i => ({ ...i.orderItem, product: i.product }))
      };
    }));

    return ordersWithItems as any;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

export const storage = new DatabaseStorage();
