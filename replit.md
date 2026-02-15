# Win-Store

## Overview

Win-Store is a factory-direct e-commerce platform that sells premium goods by cutting out middlemen (distributors, brand markups, retail overhead). The core value proposition is price transparency — showing customers how much they save compared to traditional retail. The app features product browsing, a price transparency widget with Recharts bar charts, shopping cart, checkout, factory/manufacturer stories, and user authentication via Replit Auth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

The project uses a three-folder monorepo pattern:
- **`client/`** — React frontend (SPA)
- **`server/`** — Express backend (API server)
- **`shared/`** — Shared types, schemas, and API route contracts used by both client and server

### Frontend (client/)

- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state; React Context for cart state (persisted to localStorage)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming. Custom fonts: Playfair Display (headings) and Inter (body)
- **Animations**: Framer Motion for scroll reveals and hover effects
- **Charts**: Recharts for the Price Transparency Widget (bar chart comparing retail vs. direct pricing)
- **Icons**: Lucide React
- **Build**: Vite with React plugin, outputs to `dist/public`
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

Key pages: Home, ProductList, ProductDetail, Cart, Checkout, About, NotFound. Navigation is a sticky header with responsive mobile menu.

### Backend (server/)

- **Framework**: Express.js with TypeScript, running via `tsx`
- **Database**: PostgreSQL via `node-postgres` (pg Pool)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: `drizzle-kit push` for schema synchronization (no migration files needed for dev)
- **Session Storage**: `connect-pg-simple` storing sessions in a `sessions` PostgreSQL table
- **Authentication**: Replit Auth (OpenID Connect) via Passport.js. Auth code lives in `server/replit_integrations/auth/`
- **API Design**: RESTful JSON API. Route contracts defined in `shared/routes.ts` with Zod schemas. All API routes are under `/api/`
- **Storage Pattern**: `IStorage` interface in `server/storage.ts` with `DatabaseStorage` implementation — provides a clean abstraction over database operations

### Shared Layer (shared/)

- **`shared/schema.ts`**: Drizzle table definitions (factories, categories, products, reviews, orders, orderItems) and Zod insert schemas via `drizzle-zod`
- **`shared/models/auth.ts`**: Users and sessions tables (mandatory for Replit Auth)
- **`shared/routes.ts`**: API contract object defining paths, HTTP methods, and Zod input/output schemas for all endpoints

### Database Schema

PostgreSQL tables:
- **`users`** — User profiles (id, email, firstName, lastName, profileImageUrl, timestamps). Managed by Replit Auth
- **`sessions`** — Express session storage for Replit Auth
- **`factories`** — Manufacturer/factory info (name, description, location, originStory, imageUrl, logoUrl)
- **`categories`** — Product categories (name, description, imageUrl)
- **`products`** — Products with price, originalPrice (for savings calc), factoryId, categoryId, imageUrl, videoUrl, stock, specs (JSONB)
- **`reviews`** — User product reviews (rating, comment, timestamps)
- **`orders`** — Order records linked to users
- **`orderItems`** — Individual line items in orders

Relationships: Products belong to factories and categories. Reviews belong to products and users. OrderItems belong to orders and products.

### Build Process

- **Development**: `tsx server/index.ts` runs the server with Vite dev middleware for HMR
- **Production Build**: Custom `script/build.ts` that runs Vite build for the client and esbuild for the server, outputting to `dist/`. Server deps in an allowlist are bundled; others are external
- **Production Start**: `node dist/index.cjs`

### Authentication Flow

1. Replit Auth uses OpenID Connect with Passport.js
2. Sessions stored in PostgreSQL via `connect-pg-simple`
3. User data upserted on login via `authStorage.upsertUser()`
4. Client checks auth status via `GET /api/auth/user`
5. Login redirects to `/api/login`, logout to `/api/logout`
6. `isAuthenticated` middleware protects server routes that require auth

## External Dependencies

- **PostgreSQL**: Primary database. Connection via `DATABASE_URL` environment variable. Required for all data storage and session management
- **Replit Auth (OpenID Connect)**: Authentication provider. Uses `ISSUER_URL` (defaults to `https://replit.com/oidc`), `REPL_ID`, and `SESSION_SECRET` environment variables
- **Google Fonts**: Playfair Display, Inter, DM Sans, Fira Code, Geist Mono loaded via CDN
- **Unsplash/Pixabay**: External image URLs used for hero images, factory photos, and product images
- **Recharts**: Client-side charting library for price comparison visualizations
- **Framer Motion**: Animation library for UI transitions and scroll effects

### Required Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (mandatory)
- `SESSION_SECRET` — Secret for Express session encryption (mandatory for auth)
- `REPL_ID` — Replit environment identifier (set automatically by Replit)
- `ISSUER_URL` — OpenID Connect issuer URL (defaults to Replit's OIDC endpoint)