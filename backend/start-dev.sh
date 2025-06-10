#!/bin/sh

echo "Waiting for database to be ready..."

# Wait for database to be ready
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case it's not up to date)
echo "Generating Prisma client..."
npx prisma generate

# Start the development server
echo "Starting development server..."
npm run dev 