import { z } from 'zod';
import { insertProductSchema, insertReviewSchema, products, factories, categories, reviews, orders, orderItems } from './schema';

export * from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<any>()), // Typed manually in implementation as ProductWithDetails[]
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<any>(), // Typed as ProductWithDetails
        404: errorSchemas.notFound,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
  },
  factories: {
    list: {
      method: 'GET' as const,
      path: '/api/factories' as const,
      responses: {
        200: z.array(z.custom<typeof factories.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/factories/:id' as const,
      responses: {
        200: z.custom<typeof factories.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/products/:productId/reviews' as const,
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect & { user: { username: string } }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products/:productId/reviews' as const,
      input: insertReviewSchema.pick({ rating: true, comment: true }),
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })),
        paymentMethod: z.enum(['cash', 'visa']).default('cash'),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(z.custom<any>()), // Typed as OrderWithItems[]
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
