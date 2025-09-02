#!/bin/bash

# Environment Setup Script for Signing Orchestrator
# Manages environment configurations for different deployments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Function to setup environment
setup_env() {
    local env_type="${1:-development}"
    
    echo "🔧 Setting up $env_type environment..."
    
    case "$env_type" in
        "development"|"dev")
            if [ -f "$PROJECT_DIR/env.example" ]; then
                cp "$PROJECT_DIR/env.example" "$PROJECT_DIR/.env"
                echo "✅ Development environment configured from env.example"
            else
                echo "❌ env.example not found"
                exit 1
            fi
            ;;
        "production"|"prod")
            if [ -f "$PROJECT_DIR/env.production" ]; then
                cp "$PROJECT_DIR/env.production" "$PROJECT_DIR/.env"
                echo "✅ Production environment configured from env.production"
            else
                echo "❌ env.production not found"
                exit 1
            fi
            ;;
        *)
            echo "❌ Unknown environment type: $env_type"
            echo "Usage: $0 [development|production]"
            exit 1
            ;;
    esac
    
    echo "📝 Please edit .env file with your specific configuration:"
    echo "   - DOCUSEAL_WEBHOOK_HMAC_SECRET"
    echo "   - DOCUSEAL_API_TOKEN"
    echo "   - MTSA_SOAP_USERNAME"
    echo "   - MTSA_SOAP_PASSWORD"
    echo "   - SIGNATURE_COORDINATES (if needed)"
}

# Check if environment type is provided
if [ $# -eq 0 ]; then
    echo "🔧 Environment Setup for Signing Orchestrator"
    echo "============================================="
    echo ""
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  development  - Development configuration"
    echo "  production   - Production configuration"
    echo ""
    echo "Current .env status:"
    if [ -f "$PROJECT_DIR/.env" ]; then
        echo "✅ .env file exists"
        echo "📊 Current configuration:"
        grep -E "^(NODE_ENV|APP_PORT|DOCUSEAL_BASE_URL|MTSA_ENV)=" "$PROJECT_DIR/.env" 2>/dev/null || echo "   No key variables found"
    else
        echo "❌ .env file not found"
    fi
    exit 0
fi

setup_env "$1"
