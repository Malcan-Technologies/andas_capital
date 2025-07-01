#!/bin/bash

echo "🚀 Production Deployment Script"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check disk space
check_disk_space() {
    print_status "Checking disk space..."
    df -h
    
    # Check if any partition is over 90% full
    if df -h | awk 'NR>1 {gsub(/%/,"",$5); if($5 > 90) print $0}' | grep -q .; then
        print_warning "Some partitions are over 90% full!"
        return 1
    else
        print_success "Disk space looks good"
        return 0
    fi
}

# Function to cleanup if needed
cleanup_if_needed() {
    if ! check_disk_space; then
        print_status "Cleaning up disk space..."
        
        # Clean Docker
        docker system prune -f
        docker image prune -f
        
        # Clean npm cache
        npm cache clean --force 2>/dev/null || true
        
        # Clean pnpm cache if it exists
        if command_exists pnpm; then
            pnpm store prune 2>/dev/null || true
        fi
        
        print_success "Cleanup completed"
    fi
}

# Function to stop existing services
stop_services() {
    print_status "Stopping existing services..."
    
    # Stop PM2 processes
    pm2 stop all 2>/dev/null || true
    
    # Stop Docker containers
    cd /var/www/growkapital/backend
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    print_success "Services stopped"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd /var/www/growkapital/frontend
    
    # Remove existing build
    rm -rf .next
    
    # Install dependencies
    if [ -f "pnpm-lock.yaml" ]; then
        print_status "Installing frontend dependencies with pnpm..."
        pnpm install --frozen-lockfile
    else
        print_status "Installing frontend dependencies with npm..."
        npm ci
    fi
    
    # Build the application
    print_status "Running frontend build..."
    if [ -f "pnpm-lock.yaml" ]; then
        NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 pnpm run build:prod
    else
        NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build:prod
    fi
    
    # Verify build was successful
    if [ ! -d ".next" ]; then
        print_error "Frontend build failed - .next directory not found"
        return 1
    fi
    
    print_success "Frontend build completed"
}

# Function to build admin
build_admin() {
    print_status "Building admin..."
    
    cd /var/www/growkapital/admin
    
    # Remove existing build
    rm -rf .next
    
    # Install dependencies
    if [ -f "pnpm-lock.yaml" ]; then
        print_status "Installing admin dependencies with pnpm..."
        pnpm install --frozen-lockfile
    else
        print_status "Installing admin dependencies with npm..."
        npm ci
    fi
    
    # Build the application
    print_status "Running admin build..."
    if [ -f "pnpm-lock.yaml" ]; then
        NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 pnpm run build:prod
    else
        NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build:prod
    fi
    
    # Verify build was successful
    if [ ! -d ".next" ]; then
        print_error "Admin build failed - .next directory not found"
        return 1
    fi
    
    print_success "Admin build completed"
}

# Function to build and start backend
build_backend() {
    print_status "Building and starting backend..."
    
    cd /var/www/growkapital/backend
    
    # Ensure uploads directory exists with proper permissions
    print_status "Setting up uploads directory..."
    mkdir -p uploads
    chmod 755 uploads
    
    # Build and start the backend
    docker compose -f docker-compose.prod.yml up -d --build
    
    # Wait for backend to be healthy
    print_status "Waiting for backend to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
            print_success "Backend is healthy"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting for backend..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "Backend failed to become healthy"
    return 1
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd /var/www/growkapital/backend
    
    # Run migrations
    docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        return 1
    fi
}

# Function to start frontend services
start_frontend_services() {
    print_status "Starting frontend services..."
    
    # Start frontend
    cd /var/www/growkapital/frontend
    pm2 start npm --name "growkapital-frontend" -- start
    
    # Start admin
    cd /var/www/growkapital/admin
    pm2 start npm --name "growkapital-admin" -- start
    
    # Save PM2 configuration
    pm2 save
    
    print_success "Frontend services started"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    local all_good=true
    
    # Check frontend
    print_status "Verifying frontend..."
    if curl -s -f http://localhost:3002 > /dev/null; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend verification failed"
        all_good=false
    fi
    
    # Check admin
    print_status "Verifying admin..."
    if curl -s -f http://localhost:3001 > /dev/null; then
        print_success "Admin is accessible"
    else
        print_error "Admin verification failed"
        all_good=false
    fi
    
    # Check backend
    print_status "Verifying backend..."
    if curl -s -f http://localhost:4001/api/health > /dev/null; then
        print_success "Backend is accessible"
    else
        print_error "Backend verification failed"
        all_good=false
    fi
    
    if [ "$all_good" = true ]; then
        print_success "All services are running correctly!"
        return 0
    else
        print_error "Some services failed verification"
        return 1
    fi
}

# Main deployment function
main() {
    print_status "Starting production deployment..."
    
    # Check prerequisites
    if ! command_exists docker; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command_exists pm2; then
        print_error "PM2 is not installed"
        exit 1
    fi
    
    # Cleanup if needed
    cleanup_if_needed
    
    # Stop existing services
    stop_services
    
    # Build frontend
    if ! build_frontend; then
        print_error "Frontend build failed"
        exit 1
    fi
    
    # Build admin
    if ! build_admin; then
        print_error "Admin build failed"
        exit 1
    fi
    
    # Build and start backend
    if ! build_backend; then
        print_error "Backend deployment failed"
        exit 1
    fi
    
    # Run database migrations
    if ! run_migrations; then
        print_error "Database migrations failed"
        exit 1
    fi
    
    # Start frontend services
    if ! start_frontend_services; then
        print_error "Failed to start frontend services"
        exit 1
    fi
    
    # Wait a bit for services to fully start
    sleep 10
    
    # Verify deployment
    if verify_deployment; then
        print_success "🎉 Production deployment completed successfully!"
        echo ""
        echo "Services are running on:"
        echo "  - Frontend: http://localhost:3002"
        echo "  - Admin: http://localhost:3001"
        echo "  - Backend: http://localhost:4001"
    else
        print_error "Deployment verification failed"
        exit 1
    fi
}

# Run the main function
main "$@" 