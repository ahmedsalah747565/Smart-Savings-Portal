import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { factories, categories, products, reviews, users } from "@shared/schema";
import { db } from "./db";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Replit Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // === FACTORIES ===
  app.get(api.factories.list.path, async (req, res) => {
    const factories = await storage.getFactories();
    res.json(factories);
  });

  app.get(api.factories.get.path, async (req, res) => {
    const factory = await storage.getFactory(Number(req.params.id));
    if (!factory) return res.status(404).json({ message: "Factory not found" });
    res.json(factory);
  });

  // === CATEGORIES ===
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const filters = {
      category: req.query.category as string,
      search: req.query.search as string,
      sort: req.query.sort as string,
    };
    const products = await storage.getProducts(filters);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // === REVIEWS ===
  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.productId));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const userId = req.user.claims.sub; // From Replit Auth
      const productId = Number(req.params.productId);
      
      const review = await storage.createReview(userId, productId, input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === ORDERS ===
  app.post(api.orders.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      const order = await storage.createOrder(userId, input.items);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.orders.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const orders = await storage.getOrders(userId);
    res.json(orders);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingFactories = await storage.getFactories();
  if (existingFactories.length > 0) return;

  console.log("Seeding database...");

  // 1. Create Factories
  const factoryData = [
    {
      name: "Summit Textiles",
      description: "A family-owned mill in Portugal specializing in sustainable cotton.",
      location: "Guimarães, Portugal",
      originStory: "Founded in 1954, Summit Textiles has been weaving the finest cotton for three generations. By partnering directly with Win-Store, they cut out the fashion conglomerates and bring premium bedding directly to you.",
      imageUrl: "https://images.unsplash.com/photo-1620211756488-062e08427f7a?q=80&w=2670&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2574&auto=format&fit=crop"
    },
    {
      name: "Nordic Woodworks",
      description: "Master craftsmen creating timeless furniture from responsibly sourced timber.",
      location: "Tallinn, Estonia",
      originStory: "Nordic Woodworks combines traditional joinery with modern design. Their 'Direct to Home' partnership allows them to use higher quality wood while still costing 40% less than big box stores.",
      imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2670&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2574&auto=format&fit=crop"
    },
    {
      name: "TechZen Electronics",
      description: "High-precision audio engineering lab formerly supplying major audiophile brands.",
      location: "Shenzhen, China",
      originStory: "After decades of manufacturing components for $500 headphones, TechZen decided to build their own complete units. The result? Studio-grade sound at a fraction of the price.",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=2670&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1574680096141-9877b4700d83?q=80&w=2574&auto=format&fit=crop"
    }
  ];

  const createdFactories = [];
  for (const f of factoryData) {
    const [factory] = await db.insert(factories).values(f).returning();
    createdFactories.push(factory);
  }

  // 2. Create Categories
  const categoryData = [
    { name: "Home & Living", description: "Premium essentials for your sanctuary.", imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=2676&auto=format&fit=crop" },
    { name: "Electronics", description: "Cutting-edge tech, factory direct pricing.", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop" },
    { name: "Apparel", description: "Luxury fabrics without the luxury markup.", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2670&auto=format&fit=crop" }
  ];

  const createdCategories = [];
  for (const c of categoryData) {
    const [cat] = await db.insert(categories).values(c).returning();
    createdCategories.push(cat);
  }

  // 3. Create Products
  const productData = [
    {
      name: "The Cloud Comforter",
      description: "Made with 100% organic long-staple cotton and hypoallergenic down alternative. Comparable to luxury hotel bedding.",
      price: "85.00",
      originalPrice: "250.00",
      factoryId: createdFactories[0].id,
      categoryId: createdCategories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1522771753035-4a5042305a63?q=80&w=2574&auto=format&fit=crop",
      stock: 150,
      specs: { material: "Organic Cotton", threadCount: 400, size: "Queen" }
    },
    {
      name: "Nordic Minimalist Chair",
      description: "Solid oak construction with natural oil finish. Ergonomic design meets mid-century modern aesthetic.",
      price: "145.00",
      originalPrice: "399.00",
      factoryId: createdFactories[1].id,
      categoryId: createdCategories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=2664&auto=format&fit=crop",
      stock: 50,
      specs: { wood: "Solid Oak", height: "32 inches", weightLimit: "300 lbs" }
    },
    {
      name: "SonicPro ANC Headphones",
      description: "Active Noise Cancelling headphones with 40mm drivers and 30-hour battery life. Tuned by ex-audio engineers.",
      price: "79.00",
      originalPrice: "220.00",
      factoryId: createdFactories[2].id,
      categoryId: createdCategories[1].id,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop",
      stock: 200,
      specs: { driver: "40mm Dynamic", battery: "30 Hours", features: ["ANC", "Bluetooth 5.2"] }
    },
    {
      name: "Premium Cotton Tee",
      description: "Heavyweight 220gsm organic cotton t-shirt. Pre-shrunk and garment dyed for softness.",
      price: "18.00",
      originalPrice: "55.00",
      factoryId: createdFactories[0].id,
      categoryId: createdCategories[2].id,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2680&auto=format&fit=crop",
      stock: 500,
      specs: { material: "100% Organic Cotton", weight: "220gsm", fit: "Relaxed" }
    },
    {
      name: "Organic Face Serum",
      description: "Vitamin C and E serum for radiant skin. All natural ingredients.",
      price: "25.00",
      originalPrice: "75.00",
      factoryId: createdFactories[0].id,
      categoryId: createdCategories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2574&auto=format&fit=crop",
      stock: 100,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      specs: { size: "30ml", ingredients: ["Vitamin C", "Vitamin E", "Hyaluronic Acid"] }
    },
    {
      name: "Whole Grain Granola",
      description: "Healthy and delicious granola with nuts and honey.",
      price: "12.00",
      originalPrice: "30.00",
      factoryId: createdFactories[0].id,
      categoryId: createdCategories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1517093157656-b942182005ee?q=80&w=2574&auto=format&fit=crop",
      stock: 300,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      specs: { weight: "500g", organic: true }
    }
  ];

  for (const p of productData) {
    await db.insert(products).values(p);
  }

  console.log("Seeding complete!");
}
