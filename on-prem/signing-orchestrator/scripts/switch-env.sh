#!/bin/bash

# Environment Switcher Script for Signing Orchestrator
# Easily switch between development and production configurations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to show current environment
show_current_env() {
    echo "🔍 Current Environment Status"
    echo "============================"
    
    if [ -f "$PROJECT_DIR/.env" ]; then
        local node_env=$(grep "^NODE_ENV=" "$PROJECT_DIR/.env" 2>/dev/null | cut -d'=' -f2 || echo "unknown")
        local app_port=$(grep "^APP_PORT=" "$PROJECT_DIR/.env" 2>/dev/null | cut -d'=' -f2 || echo "unknown")
        local docuseal_url=$(grep "^DOCUSEAL_BASE_URL=" "$PROJECT_DIR/.env" 2>/dev/null | cut -d'=' -f2 || echo "unknown")
        local log_level=$(grep "^LOG_LEVEL=" "$PROJECT_DIR/.env" 2>/dev/null | cut -d'=' -f2 || echo "unknown")
        
        echo "✅ .env file exists"
        echo "📊 Configuration:"
        echo "   NODE_ENV: $node_env"
        echo "   APP_PORT: $app_port"
        echo "   DOCUSEAL_BASE_URL: $docuseal_url"
        echo "   LOG_LEVEL: $log_level"
        
        # Determine environment type
        if [[ "$node_env" == "development" ]]; then
            echo "🔧 Currently using: DEVELOPMENT environment"
        elif [[ "$node_env" == "production" ]]; then
            echo "🚀 Currently using: PRODUCTION environment"
        else
            echo "❓ Environment type: UNKNOWN"
        fi
    else
        echo "❌ No .env file found"
        echo "💡 Run: $0 development  or  $0 production"
    fi
    
    echo ""
    echo "📁 Available environment files:"
    [ -f "$PROJECT_DIR/env.development" ] && echo "   ✅ env.development" || echo "   ❌ env.development"
    [ -f "$PROJECT_DIR/env.production" ] && echo "   ✅ env.production" || echo "   ❌ env.production"
    [ -f "$PROJECT_DIR/env.example" ] && echo "   ✅ env.example" || echo "   ❌ env.example"
}

# Function to switch environment
switch_env() {
    local env_type="$1"
    local source_file=""
    
    case "$env_type" in
        "development"|"dev")
            source_file="$PROJECT_DIR/env.development"
            env_name="DEVELOPMENT"
            ;;
        "production"|"prod")
            source_file="$PROJECT_DIR/env.production"
            env_name="PRODUCTION"
            ;;
        "example")
            source_file="$PROJECT_DIR/env.example"
            env_name="EXAMPLE"
            ;;
        *)
            print_error "Unknown environment type: $env_type"
            echo "Usage: $0 [development|production|example]"
            exit 1
            ;;
    esac
    
    # Check if source file exists
    if [ ! -f "$source_file" ]; then
        print_error "Environment file not found: $source_file"
        exit 1
    fi
    
    # Backup current .env if it exists
    if [ -f "$PROJECT_DIR/.env" ]; then
        local backup_name=".env.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$PROJECT_DIR/.env" "$PROJECT_DIR/$backup_name"
        print_status "Current .env backed up as: $backup_name"
    fi
    
    # Copy new environment
    cp "$source_file" "$PROJECT_DIR/.env"
    print_success "Switched to $env_name environment"
    
    # Show new configuration
    echo ""
    echo "📊 New Configuration:"
    grep -E "^(NODE_ENV|APP_PORT|DOCUSEAL_BASE_URL|LOG_LEVEL|MTSA_ENV)=" "$PROJECT_DIR/.env" 2>/dev/null || echo "   Configuration file may be incomplete"
    
    echo ""
    print_warning "Remember to:"
    echo "   1. Edit .env with your specific credentials"
    echo "   2. Restart Docker containers if running"
    echo "   3. Update webhook URLs if switching environments"
}

# Function to compare environments
compare_envs() {
    echo "🔍 Environment Comparison"
    echo "========================"
    
    local files=("env.development" "env.production" "env.example")
    local keys=("NODE_ENV" "APP_PORT" "DOCUSEAL_BASE_URL" "LOG_LEVEL" "MTSA_ENV" "CORS_ORIGINS")
    
    printf "%-20s" "Setting"
    for file in "${files[@]}"; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            printf "%-25s" "${file#env.}"
        fi
    done
    echo ""
    
    printf "%-20s" "--------------------"
    for file in "${files[@]}"; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            printf "%-25s" "-------------------------"
        fi
    done
    echo ""
    
    for key in "${keys[@]}"; do
        printf "%-20s" "$key"
        for file in "${files[@]}"; do
            if [ -f "$PROJECT_DIR/$file" ]; then
                local value=$(grep "^$key=" "$PROJECT_DIR/$file" 2>/dev/null | cut -d'=' -f2 | head -c 20 || echo "not set")
                printf "%-25s" "$value"
            fi
        done
        echo ""
    done
}

# Function to validate environment
validate_env() {
    local env_file="${1:-$PROJECT_DIR/.env}"
    
    echo "🔍 Validating Environment: $(basename "$env_file")"
    echo "=============================================="
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        return 1
    fi
    
    local required_vars=(
        "NODE_ENV"
        "APP_PORT"
        "DOCUSEAL_BASE_URL"
        "DOCUSEAL_WEBHOOK_HMAC_SECRET"
        "MTSA_SOAP_USERNAME"
        "MTSA_SOAP_PASSWORD"
    )
    
    local missing_vars=()
    local empty_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$env_file"; then
            missing_vars+=("$var")
        else
            local value=$(grep "^$var=" "$env_file" | cut -d'=' -f2)
            if [ -z "$value" ] || [[ "$value" == "your-"* ]] || [[ "$value" == "dev-"* ]]; then
                empty_vars+=("$var")
            fi
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ] && [ ${#empty_vars[@]} -eq 0 ]; then
        print_success "✅ Environment validation passed"
        return 0
    else
        print_error "❌ Environment validation failed"
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            echo "Missing variables:"
            for var in "${missing_vars[@]}"; do
                echo "   - $var"
            done
        fi
        
        if [ ${#empty_vars[@]} -gt 0 ]; then
            echo "Variables needing configuration:"
            for var in "${empty_vars[@]}"; do
                echo "   - $var"
            done
        fi
        
        return 1
    fi
}

# Main function
main() {
    case "${1:-status}" in
        "development"|"dev")
            switch_env "development"
            ;;
        "production"|"prod")
            switch_env "production"
            ;;
        "example")
            switch_env "example"
            ;;
        "status"|"current")
            show_current_env
            ;;
        "compare")
            compare_envs
            ;;
        "validate")
            validate_env "${2:-$PROJECT_DIR/.env}"
            ;;
        "help"|"-h"|"--help")
            echo "🔧 Environment Switcher for Signing Orchestrator"
            echo "==============================================="
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  development  - Switch to development environment"
            echo "  production   - Switch to production environment"
            echo "  example      - Switch to example environment"
            echo "  status       - Show current environment (default)"
            echo "  compare      - Compare all environment files"
            echo "  validate     - Validate current environment"
            echo "  help         - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 development    # Switch to dev environment"
            echo "  $0 prod          # Switch to production environment"
            echo "  $0 status        # Show current environment"
            echo "  $0 compare       # Compare all environments"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
