#!/bin/bash

echo "===== Restarting Kapital Development Environment ====="

echo ""
echo "===== Stopping all Docker containers ====="
cd /Users/ivan/Documents/Coding/Kapital/backend
docker-compose -f docker-compose.dev.yml down

echo ""
echo "===== Cleaning up build artifacts ====="
rm -rf node_modules .npm package-lock.json

echo ""
echo "===== Rebuilding Backend from scratch ====="
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "===== Waiting for Backend to initialize ====="
sleep 10

echo ""
echo "===== Running Prisma migrations ====="
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate reset --force

echo ""
echo "===== Testing Backend Health ====="
curl -s http://localhost:4001/api/health

echo ""
echo "===== Starting Frontend ====="
cd /Users/ivan/Documents/Coding/Kapital/frontend
npm run dev 