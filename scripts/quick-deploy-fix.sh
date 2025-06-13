#!/bin/bash

echo "🔧 Quick Production Deployment Fix"
echo "=================================="

# Function to print colored output
print_status() {
    echo -e "\033[0;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

# Step 1: Build the frontend first
print_status "Step 1: Building frontend..."
cd /var/www/growkapital/frontend

# Remove existing build
rm -rf .next

# Install dependencies and build
if [ -f "pnpm-lock.yaml" ]; then
    print_status "Using pnpm for frontend..."
    pnpm install --frozen-lockfile
    NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 pnpm run build:prod
else
    print_status "Using npm for frontend..."
    npm ci
    NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build:prod
fi

if [ ! -d ".next" ]; then
    print_error "Frontend build failed!"
    exit 1
fi
print_success "Frontend build completed"

# Step 2: Build the admin
print_status "Step 2: Building admin..."
cd /var/www/growkapital/admin

# Remove existing build
rm -rf .next

# Install dependencies and build
if [ -f "pnpm-lock.yaml" ]; then
    print_status "Using pnpm for admin..."
    pnpm install --frozen-lockfile
    NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 pnpm run build:prod
else
    print_status "Using npm for admin..."
    npm ci
    NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build:prod
fi

if [ ! -d ".next" ]; then
    print_error "Admin build failed!"
    exit 1
fi
print_success "Admin build completed"

# Step 3: Fix and rebuild backend
print_status "Step 3: Rebuilding backend..."
cd /var/www/growkapital/backend

# Stop existing containers
docker compose -f docker-compose.prod.yml down

# Build and start backend (the Prisma verification fix should work now)
docker compose -f docker-compose.prod.yml up -d --build

# Wait for backend to be ready
print_status "Waiting for backend to be ready..."
sleep 30

# Check if backend is running
if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "Backend is running"
    
    # Run migrations
    print_status "Running database migrations..."
    docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed, but backend is running"
    fi
else
    print_error "Backend failed to start"
    print_status "Checking backend logs..."
    docker compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Step 4: Start frontend services
print_status "Step 4: Starting frontend services..."

# Stop existing PM2 processes
pm2 stop all 2>/dev/null || true

# Start frontend
cd /var/www/growkapital/frontend
pm2 start npm --name "growkapital-frontend" -- start

# Start admin
cd /var/www/growkapital/admin
pm2 start npm --name "growkapital-admin" -- start

# Save PM2 configuration
pm2 save

print_success "Frontend services started"

# Step 5: Verify everything is working
print_status "Step 5: Verifying deployment..."

sleep 10

# Check services
frontend_ok=false
admin_ok=false
backend_ok=false

if curl -s -f http://localhost:3002 > /dev/null; then
    print_success "✅ Frontend is accessible at http://localhost:3002"
    frontend_ok=true
else
    print_error "❌ Frontend is not accessible"
fi

if curl -s -f http://localhost:3001 > /dev/null; then
    print_success "✅ Admin is accessible at http://localhost:3001"
    admin_ok=true
else
    print_error "❌ Admin is not accessible"
fi

if curl -s -f http://localhost:4001/api/health > /dev/null; then
    print_success "✅ Backend is accessible at http://localhost:4001"
    backend_ok=true
else
    print_error "❌ Backend is not accessible"
fi

# Final status
echo ""
echo "=== DEPLOYMENT STATUS ==="
if [ "$frontend_ok" = true ] && [ "$admin_ok" = true ] && [ "$backend_ok" = true ]; then
    print_success "🎉 All services are running successfully!"
    echo ""
    echo "Your services are available at:"
    echo "  - Frontend: http://localhost:3002"
    echo "  - Admin: http://localhost:3001"  
    echo "  - Backend: http://localhost:4001"
else
    print_error "Some services are not working properly"
    echo ""
    echo "Troubleshooting commands:"
    echo "  - Check PM2 logs: pm2 logs"
    echo "  - Check backend logs: cd /var/www/growkapital/backend && docker compose -f docker-compose.prod.yml logs"
    echo "  - Check container status: docker ps"
fi 