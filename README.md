# Smart Savings Portal 🛍️

![Smart Savings Portal Mockup](https://raw.githubusercontent.com/ahmedsalah747565/Smart-Savings-Portal/main/client/public/hero-mockup.png)

A high-end, modern e-commerce platform dedicated to factory-direct products. **Smart Savings Portal** connects consumers directly with manufacturers, eliminating middleman markups and providing significant savings on premium goods.

---

## ✨ Features

- 🏗️ **Factory-Direct Model**: Browse products directly from authenticated factories.
- 💰 **Real-Time Savings**: Dynamic price comparisons against retail market rates.
- 🌍 **Bilingual Support**: Full internationalization for English and Arabic users.
- 📦 **Inventory Management**: Real-time stock tracking and expiry indicators for perishable goods.
- 🔐 **Secure Auth**: Robust user authentication and profile management via Passport.js.
- 🛒 **Smart Cart**: Bulk ordering support with Minimum Order Quantity (MOQ) logic.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile experiences.

---

## 🚀 Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** + **Shadcn UI** for premium styling
- **Framer Motion** for smooth, high-end animations
- **TanStack Query** for efficient data fetching
- **i18next** for seamless language switching

### Backend
- **Express 5** + **Node.js**
- **PostgreSQL** with **Drizzle ORM**
- **Passport.js** for secure session-based authentication
- **Zod** for end-to-end type safety and validation

---

## 🛠️ Getting Started

Follow these steps to set up the project from scratch on your local machine.

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **PostgreSQL**: v17 or v18
- **npm** or **yarn**

### 2. Clone the Repository
```bash
git clone https://github.com/ahmedsalah747565/Smart-Savings-Portal.git
cd Smart-Savings-Portal
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup

We have made it easy to "share" and initialize the database. Choose one of the following methods:

#### Option A: Quick Setup (Automated Linux Script) - RECOMMENDED
If you are on Linux, simply run:
```bash
npm run db:setup
```
This script will initialize a local PostgreSQL instance, create the `smart_savings` database, and load the pre-configured **25+ product seed** data automatically.

#### Option B: Docker (Zero Installation)
If you have Docker installed, you can start the entire stack (Database + App) with:
```bash
docker-compose up --build
```
The database will be automatically provisioned with all seed data.

#### Option C: Manual Setup
If you prefer manual control:
1. Create the database `smart_savings`.
2. Update `.env` with your `DATABASE_URL`.
3. Import the seed data: `psql -d smart_savings -f infra/postgres/init/db_seed.sql`

### 5. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database URL (Update with your credentials)
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5433/smart_savings?host=/home/YOUR_USERNAME/smart_db"

# Session Secret (Use a strong random string)
SESSION_SECRET="your_secure_secret_here"

# Application Settings
NODE_ENV="development"
PORT=5000
```

### 6. Initialize Database Schema
Push the Drizzle schema to your database:
```bash
npm run db:push
```

### 7. Run the Application
Start the development server:
```bash
npm run dev
```
The application will be available at [http://localhost:5000](http://localhost:5000).

---

## 📜 Available Scripts

- `npm run dev` - Starts the development server (Backend + Vite Frontend).
- `npm run build` - Builds the project for production.
- `npm start` - Runs the production build.
- `npm run db:push` - Synchronizes your local DB with the Drizzle schema.
- `npm run check` - Runs TypeScript type checking.

---

## 🧑‍💻 Default Test Account
- **Username**: `test@example.com`
- **Password**: `password123`

---

## 🔧 Troubleshooting

- **Port 5000 Busy**: If the port is in use, run `fuser -k 5000/tcp` or change `PORT` in `.env`.
- **DB Connection Error**: Verify your `DATABASE_URL` and ensure PostgreSQL is running (`pg_ctl status`).
- **Missing Images**: Ensure you have an active internet connection, as product images are served via Unsplash CDN.

---

Built with ❤️ for the Smart Savings Community.
