#!/bin/bash

# Stop and remove containers
docker compose -f docker-compose.dev.yml down

# Remove bcrypt volume if it exists
docker volume rm backend_bcrypt_modules 2>/dev/null || true

# Rebuild and start containers
docker compose -f docker-compose.dev.yml up -d --build

# Wait a moment for the container to initialize
sleep 5

# Execute command in the backend container to rebuild bcrypt
docker compose -f docker-compose.dev.yml exec backend sh -c "cd /app && npm rebuild bcrypt --build-from-source"

# Restart the backend container
docker compose -f docker-compose.dev.yml restart backend

echo "bcrypt has been rebuilt in the container environment" 