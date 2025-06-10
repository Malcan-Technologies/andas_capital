#!/bin/bash

echo "Waiting for database to be ready..."
# Wait for database to be ready
sleep 5

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start the development server
echo "Starting development server..."
npm run dev 