#!/bin/bash

echo "🔧 Fixing Prisma client issues..."

# Clean up existing Prisma client
echo "🧹 Cleaning up existing Prisma client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Reinstall Prisma client
echo "📦 Reinstalling Prisma client..."
npm install @prisma/client

# Generate Prisma client
echo "⚙️ Generating Prisma client..."
npx prisma generate

# Verify Prisma client
echo "✅ Verifying Prisma client..."
node scripts/verify-prisma-client.js

echo "🎉 Prisma client fix completed!" 