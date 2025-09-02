#!/bin/bash

# Signing Orchestrator Deployment Script
# Syncs codebase and deploys to on-premises server

set -e

# Configuration
REMOTE_HOST="opg-srv"  # Using SSH config alias for simplified access
REMOTE_PORT=""         # Port handled by SSH config
REMOTE_USER=""         # User handled by SSH config
REMOTE_DIR="/home/admin-kapital/signing-orchestrator"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Function to check if remote server is accessible
check_remote_connection() {
    print_status "Checking connection to remote server..."
    if ssh -o ConnectTimeout=10 $REMOTE_HOST "echo 'Connection successful'" >/dev/null 2>&1; then
        print_success "Remote server is accessible"
        return 0
    else
        print_error "Cannot connect to remote server"
        return 1
    fi
}

# Function to sync files to remote server
sync_files() {
    print_status "Syncing files to remote server..."
    
    # Create remote directory if it doesn't exist
    ssh $REMOTE_HOST "mkdir -p $REMOTE_DIR"
    
    # Sync files using rsync (excludes node_modules, dist, logs, etc.)
    rsync -avz --delete \
        --exclude 'node_modules/' \
        --exclude 'dist/' \
        --exclude 'logs/' \
        --exclude 'data/' \
        --exclude '.git/' \
        --exclude '.env' \
        --exclude '*.log' \
        --exclude '.DS_Store' \
        -e "ssh" \
        "$LOCAL_DIR/" "$REMOTE_HOST:$REMOTE_DIR/"
    
    print_success "Files synced successfully"
}

# Function to setup environment on remote server
setup_environment() {
    print_status "Setting up environment on remote server..."
    
    ssh $REMOTE_HOST << 'EOF'
        cd /home/admin-kapital/signing-orchestrator
        
        # Create .env file if it doesn't exist
        if [ ! -f .env ]; then
            echo "Creating .env file from template..."
            cp env.example .env
            echo "⚠️  Please edit .env file with your configuration"
        fi
        
        # Create necessary directories
        mkdir -p data/signed logs
        
        # Set proper permissions
        chmod +x deploy.sh 2>/dev/null || true
        
        echo "Environment setup completed"
EOF
    
    print_success "Environment setup completed"
}

# Function to build and deploy Docker containers
deploy_containers() {
    print_status "Building and deploying Docker containers..."
    
    ssh $REMOTE_HOST << 'EOF'
        cd /home/admin-kapital/signing-orchestrator
        
        echo "🛑 Stopping existing containers..."
        docker-compose down 2>/dev/null || true
        
        echo "🏗️  Building Docker images..."
        docker-compose build --no-cache
        
        echo "🚀 Starting containers..."
        docker-compose up -d
        
        echo "⏳ Waiting for services to start..."
        sleep 10
        
        echo "📊 Container status:"
        docker-compose ps
        
        echo "🧪 Testing health endpoint..."
        sleep 5
        if curl -f http://localhost:4010/health >/dev/null 2>&1; then
            echo "✅ Health check passed"
        else
            echo "❌ Health check failed"
            echo "📋 Container logs:"
            docker-compose logs --tail=20 signing-orchestrator
        fi
EOF
    
    print_success "Docker deployment completed"
}

# Function to show deployment status
show_status() {
    print_status "Checking deployment status..."
    
    ssh $REMOTE_HOST << 'EOF'
        cd /home/admin-kapital/signing-orchestrator
        
        echo "📊 Container Status:"
        docker-compose ps
        
        echo ""
        echo "🔍 Service Health:"
        curl -s http://localhost:4010/health | jq . 2>/dev/null || curl -s http://localhost:4010/health
        
        echo ""
        echo "📈 Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        
        echo ""
        echo "📋 Recent Logs (last 10 lines):"
        docker-compose logs --tail=10 signing-orchestrator
EOF
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    
    ssh $REMOTE_HOST << 'EOF'
        cd /home/admin-kapital/signing-orchestrator
        docker-compose logs -f signing-orchestrator
EOF
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    
    ssh $REMOTE_HOST << 'EOF'
        cd /home/admin-kapital/signing-orchestrator
        docker-compose restart
        sleep 5
        docker-compose ps
EOF
    
    print_success "Services restarted"
}

# Function to clean up old Docker resources
cleanup() {
    print_status "Cleaning up old Docker resources..."
    
    ssh $REMOTE_HOST << 'EOF'
        echo "🧹 Removing unused Docker images..."
        docker image prune -f
        
        echo "🧹 Removing unused Docker volumes..."
        docker volume prune -f
        
        echo "🧹 Removing unused Docker networks..."
        docker network prune -f
        
        echo "📊 Docker disk usage:"
        docker system df
EOF
    
    print_success "Cleanup completed"
}

# Function to backup current deployment
backup_deployment() {
    print_status "Creating backup of current deployment..."
    
    ssh $REMOTE_HOST << 'EOF'
        cd /home/admin-kapital
        
        BACKUP_NAME="signing-orchestrator-backup-$(date +%Y%m%d_%H%M%S)"
        
        echo "📦 Creating backup: $BACKUP_NAME"
        
        # Create backup directory
        mkdir -p backups
        
        # Backup current deployment
        if [ -d signing-orchestrator ]; then
            tar -czf "backups/$BACKUP_NAME.tar.gz" signing-orchestrator/
            echo "✅ Backup created: backups/$BACKUP_NAME.tar.gz"
            
            # Keep only last 5 backups
            cd backups
            ls -t signing-orchestrator-backup-*.tar.gz | tail -n +6 | xargs rm -f 2>/dev/null || true
            echo "📋 Available backups:"
            ls -la signing-orchestrator-backup-*.tar.gz 2>/dev/null || echo "No backups found"
        else
            echo "⚠️  No existing deployment to backup"
        fi
EOF
    
    print_success "Backup completed"
}

# Main deployment function
deploy() {
    echo "🚀 Starting Signing Orchestrator Deployment"
    echo "==========================================="
    echo "📍 Local directory: $LOCAL_DIR"
    echo "🌐 Remote server: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PORT"
    echo "📁 Remote directory: $REMOTE_DIR"
    echo ""
    
    # Check connection
    if ! check_remote_connection; then
        print_error "Deployment aborted due to connection failure"
        exit 1
    fi
    
    # Create backup
    backup_deployment
    
    # Sync files
    sync_files
    
    # Setup environment
    setup_environment
    
    # Deploy containers
    deploy_containers
    
    # Show status
    show_status
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Edit .env file on remote server if needed"
    echo "   2. Configure DocuSeal webhook URL"
    echo "   3. Test the signing workflow"
    echo ""
    echo "🔧 Useful commands:"
    echo "   ./deploy.sh status    - Check deployment status"
    echo "   ./deploy.sh logs      - View application logs"
    echo "   ./deploy.sh restart   - Restart services"
    echo "   ./deploy.sh cleanup   - Clean up old Docker resources"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "status")
        check_remote_connection && show_status
        ;;
    "logs")
        check_remote_connection && show_logs
        ;;
    "restart")
        check_remote_connection && restart_services
        ;;
    "cleanup")
        check_remote_connection && cleanup
        ;;
    "backup")
        check_remote_connection && backup_deployment
        ;;
    "sync")
        check_remote_connection && sync_files
        ;;
    *)
        echo "Usage: $0 [deploy|status|logs|restart|cleanup|backup|sync]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  status   - Check deployment status"
        echo "  logs     - View application logs"
        echo "  restart  - Restart services"
        echo "  cleanup  - Clean up old Docker resources"
        echo "  backup   - Create backup of current deployment"
        echo "  sync     - Sync files only (no Docker rebuild)"
        exit 1
        ;;
esac
