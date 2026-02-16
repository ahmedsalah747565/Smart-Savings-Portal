#!/bin/bash

# Configuration
DB_NAME="smart_savings"
DB_USER=$(whoami)
DB_PORT=5433
DB_DIR="$HOME/smart_db"
LOG_FILE="$DB_DIR/logfile"
SEED_FILE="./infra/postgres/init/db_seed.sql"

echo "🚀 Starting Smart Savings Portal Database Setup..."

# 1. Create data directory
mkdir -p "$DB_DIR/data"

# 2. Initialize PostgreSQL database if not already done
if [ ! -f "$DB_DIR/data/PG_VERSION" ]; then
    echo "📦 Initializing PostgreSQL..."
    /usr/lib/postgresql/17/bin/initdb -D "$DB_DIR/data"
else
    echo "✅ Database already initialized."
fi

# 3. Start PostgreSQL
echo "🔌 Starting PostgreSQL on port $DB_PORT..."
/usr/lib/postgresql/17/bin/pg_ctl -D "$DB_DIR/data" \
  -l "$LOG_FILE" \
  -o "-p $DB_PORT -k $DB_DIR" start

# Wait a moment for postgres to start
sleep 2

# 4. Create the database if it doesn't exist
if ! /usr/lib/postgresql/17/bin/psql -p $DB_PORT -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "🛠️ Creating database $DB_NAME..."
    /usr/lib/postgresql/17/bin/createdb -p $DB_PORT -h "$DB_DIR" "$DB_NAME"
    
    # 5. Load Seed Data
    if [ -f "$SEED_FILE" ]; then
        echo "🌱 Loading seed data from $SEED_FILE..."
        /usr/lib/postgresql/17/bin/psql -p $DB_PORT -h "$DB_DIR" -d "$DB_NAME" -f "$SEED_FILE"
    else
        echo "⚠️ Seed file not found at $SEED_FILE. Running schema push instead..."
        npm run db:push
    fi
else
    echo "✅ Database $DB_NAME already exists."
fi

echo "✨ Setup complete! You can now run 'npm run dev'"
