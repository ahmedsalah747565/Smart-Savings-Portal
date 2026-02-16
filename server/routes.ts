import type { Express, Request, Response } from "express";
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
  app.get(api.factories.list.path, async (_req: Request, res: Response) => {
    const factories = await storage.getFactories();
    res.json(factories);
  });

  app.get(api.factories.get.path, async (req: Request, res: Response) => {
    const factory = await storage.getFactory(Number(req.params.id));
    if (!factory) return res.status(404).json({ message: "Factory not found" });
    res.json(factory);
  });

  // === CATEGORIES ===
  app.get(api.categories.list.path, async (_req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req: Request, res: Response) => {
    const filters = {
      category: req.query.category as string,
      search: req.query.search as string,
      sort: req.query.sort as string,
    };
    const products = await storage.getProducts(filters);
    res.json(products);
  });

  app.get(api.products.get.path, async (req: Request, res: Response) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // === REVIEWS ===
  app.get(api.reviews.list.path, async (req: Request, res: Response) => {
    const reviews = await storage.getReviews(Number(req.params.productId));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, isAuthenticated, async (req: any, res: Response) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const userId = req.user.claims ? req.user.claims.sub : req.user.id;
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
  app.post(api.orders.create.path, isAuthenticated, async (req: any, res: Response) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.user.claims ? req.user.claims.sub : req.user.id;

      const order = await storage.createOrder(userId, input.items, input.paymentMethod);
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

  app.get(api.orders.list.path, isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims ? req.user.claims.sub : req.user.id;
    const orders = await storage.getOrders(userId);
    res.json(orders);
  });

  // === VENDOR ===
  app.post("/api/user/apply-vendor", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims ? req.user.claims.sub : req.user.id;
    await storage.updateUserRole(userId, "vendor");
    res.json({ message: "Successfully applied as vendor" });
  });

  app.get("/api/vendor/products", isAuthenticated, async (req: any, res) => {
    if (req.user.role !== "vendor" && req.user.role !== "manufacturer") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const userId = req.user.claims ? req.user.claims.sub : req.user.id;
    const products = await storage.getVendorProducts(userId);
    res.json(products);
  });

  app.post("/api/vendor/products", isAuthenticated, async (req: any, res) => {
    if (req.user.role !== "vendor" && req.user.role !== "manufacturer") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const userId = req.user.claims ? req.user.claims.sub : req.user.id;
    const product = await storage.createProduct(userId, req.body);
    res.status(201).json(product);
  });

  app.patch("/api/vendor/products/:id", isAuthenticated, async (req: any, res) => {
    if (req.user.role !== "vendor" && req.user.role !== "manufacturer") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const userId = req.user.claims ? req.user.claims.sub : req.user.id;
    const productId = Number(req.params.id);
    const product = await storage.updateProduct(userId, productId, req.body);
    res.json(product);
  });

  app.get("/api/categories", async (_req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
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
      nameEn: "Summit Textiles",
      nameAr: "قمة المنسوجات",
      descriptionEn: "A family-owned mill in Portugal specializing in sustainable cotton.",
      descriptionAr: "مطحنة مملوكة لعائلة في البرتغال متخصصة في القطن المستدام.",
      locationEn: "Guimarães, Portugal",
      locationAr: "غيماريش، البرتغال",
      originStoryEn: "Founded in 1954, Summit Textiles has been weaving the finest cotton for three generations. By partnering directly with Win-Store, they cut out the fashion conglomerates and bring premium bedding directly to you.",
      originStoryAr: "تأسست شركة Summit Textiles في عام 1954، وهي تقوم بنسج أجود أنواع القطن لثلاثة أجيال. ومن خلال الشراكة المباشرة مع Win-Store، فإنهم يتخلصون من تكتلات الأزياء ويقدمون لك مفروشات فاخرة مباشرة.",
      imageUrl: "https://images.unsplash.com/photo-1620211756488-062e08427f7a?q=80&w=2670&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2574&auto=format&fit=crop"
    },
    {
      nameEn: "Nordic Woodworks",
      nameAr: "نورديك للمشغولات الخشبية",
      descriptionEn: "Master craftsmen creating timeless furniture from responsibly sourced timber.",
      descriptionAr: "حرفيون ماهرون يصنعون أثاثًا خالدًا من أخشاب من مصادر مسؤولة.",
      locationEn: "Tallinn, Estonia",
      locationAr: "تالين، إستونيا",
      originStoryEn: "Nordic Woodworks combines traditional joinery with modern design. Their 'Direct to Home' partnership allows them to use higher quality wood while still costing 40% less than big box stores.",
      originStoryAr: "تجمع شركة Nordic Woodworks بين النجارة التقليدية والتصميم الحديث. وتسمح لهم شراكتهم 'Direct to Home' باستخدام خشب عالي الجودة مع تكلفة أقل بنسبة 40% من المتاجر الكبرى.",
      imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2670&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2574&auto=format&fit=crop"
    },
    {
      nameEn: "TechZen Electronics",
      nameAr: "تيك زين للإلكترونيات",
      descriptionEn: "High-precision audio engineering lab formerly supplying major audiophile brands.",
      descriptionAr: "مختبر هندسة صوتية عالي الدقة كان يزود سابقًا كبار العلامات التجارية لعشاق الصوت.",
      locationEn: "Shenzhen, China",
      locationAr: "شنتشن، الصين",
      originStoryEn: "After decades of manufacturing components for $500 headphones, TechZen decided to build their own complete units. The result? Studio-grade sound at a fraction of the price.",
      originStoryAr: "بعد عقود من تصنيع مكونات سماعات الرأس بقيمة 500 دولار، قررت TechZen بناء وحداتها الكاملة الخاصة. النتيجة؟ صوت بمستوى الاستوديو بجزء بسيط من السعر.",
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
    { nameEn: "Home & Living", nameAr: "المنزل والمعيشة", descriptionEn: "Premium essentials for your sanctuary.", descriptionAr: "أساسيات متميزة لملاذك الخاص.", imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=2676&auto=format&fit=crop" },
    { nameEn: "Electronics", nameAr: "إلكترونيات", descriptionEn: "Cutting-edge tech, factory direct pricing.", descriptionAr: "أحدث التقنيات بأسعار المصنع مباشرة.", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop" },
    { nameEn: "Apparel", nameAr: "ملابس", descriptionEn: "Luxury fabrics without the luxury markup.", descriptionAr: "أقمشة فاخرة دون زيادة في سعر الرفاهية.", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2670&auto=format&fit=crop" }
  ];

  const createdCategories = [];
  for (const c of categoryData) {
    const [cat] = await db.insert(categories).values(c).returning();
    createdCategories.push(cat);
  }

  // 3. Create Products
  const productData = [
    {
      nameEn: "The Cloud Comforter",
      nameAr: "لحاف السحاب",
      descriptionEn: "Made with 100% organic long-staple cotton and hypoallergenic down alternative. Comparable to luxury hotel bedding.",
      descriptionAr: "مصنوع من القطن العضوي طويل التيلة بنسبة 100% وبديل مضاد للحساسية. يمكن مقارنتها بمفروشات الفنادق الفاخرة.",
      price: "85.00",
      originalPrice: "250.00",
      factoryId: createdFactories[0].id,
      categoryId: createdCategories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1522771753035-4a5042305a63?q=80&w=2574&auto=format&fit=crop",
      stock: 150,
      specs: { material: "Organic Cotton", threadCount: 400, size: "Queen" }
    },
    {
      nameEn: "Nordic Minimalist Chair",
      nameAr: "كرسي نورديك مينيماليست",
      descriptionEn: "Solid oak construction with natural oil finish. Ergonomic design meets mid-century modern aesthetic.",
      descriptionAr: "هيكل من البلوط الصلب مع لمسة نهائية طبيعية. يلبي التصميم المريح جمالية منتصف القرن الحديثة.",
      price: "145.00",
      originalPrice: "399.00",
      factoryId: createdFactories[1].id,
      categoryId: createdCategories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=2664&auto=format&fit=crop",
      stock: 50,
      specs: { wood: "Solid Oak", height: "32 inches", weightLimit: "300 lbs" }
    },
    {
      nameEn: "SonicPro ANC Headphones",
      nameAr: "سماعات سونيك برو بخاصية إلغاء الضوضاء",
      descriptionEn: "Active Noise Cancelling headphones with 40mm drivers and 30-hour battery life. Tuned by ex-audio engineers.",
      descriptionAr: "سماعات رأس بخاصية إلغاء الضوضاء النشطة مع مشغلات 40 مم وعمر بطارية يصل إلى 30 ساعة. تم ضبطها بواسطة مهندسي صوت سابقين.",
      price: "79.00",
      originalPrice: "220.00",
      factoryId: createdFactories[2].id,
      categoryId: createdCategories[1].id,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop",
      stock: 200,
      specs: { driver: "40mm Dynamic", battery: "30 Hours", features: ["ANC", "Bluetooth 5.2"] }
    },
    {
      nameEn: "Premium Cotton Tee",
      nameAr: "تي شيرت قطني فاخر",
      descriptionEn: "Heavyweight 220gsm organic cotton t-shirt. Pre-shrunk and garment dyed for softness.",
      descriptionAr: "تي شيرت من القطن العضوي بوزن ثقيل 220 جرام للمتر المربع. مغسول مسبقاً ومصبوغ من أجل النعومة.",
      price: "18.00",
      originalPrice: "55.00",
      factoryId: createdFactories[0].id,
      categoryId: createdCategories[2].id,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2680&auto=format&fit=crop",
      stock: 500,
      specs: { material: "100% Organic Cotton", weight: "220gsm", fit: "Relaxed" }
    },
    {
      nameEn: "Organic Face Serum",
      nameAr: "سيروم الوجه العضوي",
      descriptionEn: "Vitamin C and E serum for radiant skin. All natural ingredients.",
      descriptionAr: "سيروم فيتامين C و E لبشرة مشرقة. جميع المكونات طبيعية.",
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
      nameEn: "Whole Grain Granola",
      nameAr: "جرانولا الحبوب الكاملة",
      descriptionEn: "Healthy and delicious granola with nuts and honey.",
      descriptionAr: "جرانولا صحية ولذيذة مع المكسرات والعسل.",
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
