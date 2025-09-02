# Use Node.js 18 LTS Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    tzdata

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S orchestrator -u 1001

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript (disabled for now - will be enabled when MTSA is ready)
# RUN npm run build

# Create necessary directories
RUN mkdir -p /data/signed /var/log/signing-orchestrator && \
    chown -R orchestrator:nodejs /data /var/log/signing-orchestrator /app

# Switch to non-root user
USER orchestrator

# Expose port
EXPOSE 4010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4010/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application (using ts-node for now)
CMD ["npx", "ts-node", "src/server.ts"]
