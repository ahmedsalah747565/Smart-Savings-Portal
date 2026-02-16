# Smart Savings Portal

A modern e-commerce platform for factory-direct products with significant savings. Built with React, Express, PostgreSQL, and Drizzle ORM.

## Features

- 🛍️ **Factory-Direct Shopping**: Browse 25+ products across multiple categories (Gourmet & Pantry, Beverages, Superfoods, Beauty & Cosmetics, Health & Pharmacy, Fresh Dairy)
- 💰 **Smart Savings**: See real-time savings compared to retail prices
- 🌍 **Bilingual Support**: Full English and Arabic language support
- 📦 **Expiry Tracking**: Visual indicators for perishable products
- 🔐 **User Authentication**: Secure login and profile management
- 🛒 **Shopping Cart**: Add items and checkout with MOQ (Minimum Order Quantity) of 30 items
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Shadcn UI** components
- **i18next** for internationalization

### Backend
- **Express 5** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Passport.js** for authentication
- **Express Session** with PostgreSQL store

## Prerequisites

Before deploying this project on another device, ensure you have:

- **Node.js** (v20.x or higher)
- **PostgreSQL** (v17 or v18)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Deployment Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Smart-Savings-Portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

#### Option A: Using PostgreSQL 17 (Custom Data Directory)

If you want to use a custom PostgreSQL instance:

```bash
# Create data directory
mkdir -p ~/smart_db/data

# Initialize PostgreSQL database
/usr/lib/postgresql/17/bin/initdb -D ~/smart_db/data

# Start PostgreSQL on port 5433
/usr/lib/postgresql/17/bin/pg_ctl -D ~/smart_db/data \
  -l ~/smart_db/logfile \
  -o "-p 5433 -k ~/smart_db" start

# Create the database
/usr/lib/postgresql/17/bin/createdb -p 5433 -h ~/smart_db smart_savings
```

#### Option B: Using System PostgreSQL

If you have PostgreSQL installed system-wide:

```bash
# Start PostgreSQL service
sudo service postgresql start

# Create database (adjust port if needed)
createdb -p 5432 smart_savings
```

### 4. Configure Environment Variables

Create a `.env` file in the project root (or export these variables):

```bash
# For custom PostgreSQL on port 5433
export DATABASE_URL="postgres://YOUR_USERNAME@localhost:5433/smart_savings"

# For system PostgreSQL on port 5432
# export DATABASE_URL="postgres://YOUR_USERNAME@localhost:5432/smart_savings"

# Session secret (change this to a random string)
export SESSION_SECRET="your_very_secret_key_here_change_this"

# Node environment
export NODE_ENV="development"
```

**Important**: Replace `YOUR_USERNAME` with your system username (e.g., `postgres` or your Linux username).

### 5. Initialize Database Schema

Push the database schema using Drizzle:

```bash
DATABASE_URL="postgres://YOUR_USERNAME@localhost:5433/smart_savings" npm run db:push
```

### 6. Seed the Database

The application will automatically seed the database with initial data (categories, factories, and 25 products) on first run.

### 7. Start the Development Server

```bash
DATABASE_URL="postgres://YOUR_USERNAME@localhost:5433/smart_savings" \
SESSION_SECRET="your_very_secret_key_here" \
npm run dev
```

The application will be available at: **http://localhost:5000**

### 8. Access the Application

Open your browser and navigate to:
- **Home Page**: http://localhost:5000/
- **Products**: http://localhost:5000/products
- **About**: http://localhost:5000/about

## Production Deployment

For production deployment:

### 1. Build the Application

```bash
npm run build
```

### 2. Set Production Environment Variables

```bash
export NODE_ENV="production"
export DATABASE_URL="postgres://YOUR_USERNAME@localhost:5433/smart_savings"
export SESSION_SECRET="your_production_secret_key"
export PORT="5000"
```

### 3. Start the Production Server

```bash
npm start
```

## Database Management

### Check PostgreSQL Status

```bash
# For custom instance
/usr/lib/postgresql/17/bin/pg_ctl -D ~/smart_db/data status

# For system PostgreSQL
sudo service postgresql status
```

### Stop PostgreSQL

```bash
# For custom instance
/usr/lib/postgresql/17/bin/pg_ctl -D ~/smart_db/data stop

# For system PostgreSQL
sudo service postgresql stop
```

### View Database Contents

```bash
# Connect to database
psql -p 5433 -d smart_savings

# Or for system PostgreSQL
psql -p 5432 -d smart_savings

# Useful queries:
# SELECT * FROM products;
# SELECT * FROM categories;
# SELECT * FROM factories;
```

## Troubleshooting

### Port Already in Use

If port 5000 is already in use:

```bash
# Kill the process using port 5000
fuser -k 5000/tcp

# Or find and kill manually
lsof -i :5000
kill -9 <PID>
```

### Database Connection Issues

1. **Check PostgreSQL is running**:
   ```bash
   pg_lsclusters  # Shows all PostgreSQL clusters
   ```

2. **Verify connection string**: Ensure `DATABASE_URL` matches your PostgreSQL setup

3. **Check PostgreSQL logs**:
   ```bash
   tail -f ~/smart_db/logfile
   ```

### Missing Dependencies

If you encounter module errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Disk Space Issues

If you run out of disk space:

```bash
# Clear npm cache
npm cache clean --force

# Clear system cache
rm -rf ~/.cache/*
rm -rf ~/.npm/*
```

## Project Structure

```
Smart-Savings-Portal/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and i18n
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   └── index.html         # HTML template
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── db.ts              # Database connection
│   └── index.ts           # Server entry point
├── shared/                # Shared code between client/server
│   ├── schema.ts          # Database schema & types
│   ├── routes.ts          # API route definitions
│   └── models/            # Data models
├── migrations/            # Database migrations
└── package.json           # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push schema changes to database

## Default Test User

For testing authentication:
- **Email**: test@example.com
- **Password**: password123

## API Endpoints

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - List categories
- `GET /api/factories` - List factories
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders` - Get user orders (requires auth)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/user` - Get current user

## Image Assets

All product, category, and factory images are sourced from Unsplash and are properly attributed. Images are loaded via CDN for optimal performance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error details
3. Ensure all environment variables are correctly set
4. Verify PostgreSQL is running and accessible

---

**Built with ❤️ for factory-direct savings**
