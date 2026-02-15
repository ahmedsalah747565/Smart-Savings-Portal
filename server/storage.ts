import {
  users, factories, categories, products, reviews, orders, orderItems,
  type User, type InsertUser, type Factory, type Category, type Product, type Review, type Order, type OrderItem,
  type CreateReviewRequest, type CreateOrderRequest, type ProductWithDetails, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users (Auth handled by Replit Auth, but we might need these)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
  createOrder(userId: string, items: { productId: number; quantity: number }[]): Promise<Order>;
  getOrders(userId: string): Promise<OrderWithItems[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
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
    .innerJoin(factories, eq(products.factoryId, factories.id))
    .innerJoin(categories, eq(products.categoryId, categories.id));

    if (filters?.category) {
      // Assuming filters.category is category name for now, or ID. Let's use name match or ID if number
      const catId = parseInt(filters.category);
      if (!isNaN(catId)) {
        query.where(eq(products.categoryId, catId));
      } else {
        // If string name, we'd need to join categories and filter by name, but let's stick to ID for simplicity or handle logic here
      }
    }

    if (filters?.search) {
      query.where(sql`${products.name} ILIKE ${`%${filters.search}%`}`);
    }

    if (filters?.sort) {
      if (filters.sort === 'price_asc') query.orderBy(products.price);
      else if (filters.sort === 'price_desc') query.orderBy(desc(products.price));
      else if (filters.sort === 'newest') query.orderBy(desc(products.id));
    }

    const results = await query;
    return results.map(r => ({
      ...r.product,
      factory: r.factory,
      category: r.category,
    }));
  }

  async getProduct(id: number): Promise<ProductWithDetails | undefined> {
    const [result] = await db.select({
      product: products,
      factory: factories,
      category: categories,
    })
    .from(products)
    .innerJoin(factories, eq(products.factoryId, factories.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id));

    if (!result) return undefined;

    return {
      ...result.product,
      factory: result.factory,
      category: result.category,
    };
  }

  // Reviews
  async getReviews(productId: number): Promise<(Review & { user: { username: string } })[]> {
    const results = await db.select({
      review: reviews,
      user: {
        username: users.username, // Just need username for display
      }
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

    return results.map(r => ({ ...r.review, user: r.user }));
  }

  async createReview(userId: string, productId: number, review: CreateReviewRequest): Promise<Review> {
    const [newReview] = await db.insert(reviews).values({
      userId,
      productId,
      ...review
    }).returning();
    return newReview;
  }

  // Orders
  async createOrder(userId: string, items: { productId: number; quantity: number }[]): Promise<Order> {
    // Calculate total price
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const price = Number(product.price);
      total += price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price // Store snapshot of price
      });
    }

    // Create order
    const [order] = await db.insert(orders).values({
      userId,
      total: total.toString(),
      status: "pending"
    }).returning();

    // Create order items
    for (const itemData of orderItemsData) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: itemData.productId,
        quantity: itemData.quantity,
        price: itemData.price
      });
    }

    return order;
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

    return ordersWithItems;
  }
}

export const storage = new DatabaseStorage();
