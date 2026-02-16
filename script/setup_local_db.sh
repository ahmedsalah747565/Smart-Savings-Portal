#!/bin/bash
set -e

PG_DIR="/home/mr_hacker/postgres_data"
PG_BIN="/usr/lib/postgresql/18/bin"
PORT=5433

if [ ! -d "$PG_DIR" ]; then
    echo "Initializing database..."
    $PG_BIN/initdb -D "$PG_DIR"
fi

echo "Starting database on port $PORT..."
mkdir -p "$PG_DIR/sockets"
$PG_BIN/pg_ctl -D "$PG_DIR" -l "$PG_DIR/server.log" -o "-p $PORT -c unix_socket_directories=$PG_DIR/sockets" start || echo "Postgres might be already running"

echo "Creating database smart_savings..."
$PG_BIN/createdb -p $PORT -h localhost smart_savings || echo "Database might already exist"

echo "Database is ready."
echo "DATABASE_URL=postgres://$(whoami)@localhost:$PORT/smart_savings"
