# 🚀 Signing Orchestrator Deployment Guide

This guide covers deploying the Signing Orchestrator service in your on-premises environment alongside DocuSeal and MyTrustSigner Agent.

## 📋 Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+ recommended)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB minimum for signed documents
- **Network**: Outbound access for CRL/OCSP validation

### Existing Services

- **DocuSeal**: Running and accessible
- **MyTrustSigner Agent**: Deployed with SOAP endpoints
- **Valid Certificates**: SOAP credentials and API tokens

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DocuSeal      │    │   Signing       │    │ MyTrustSigner   │
│   (Port 3001)   │───▶│   Orchestrator  │───▶│ Agent (SOAP)    │
│                 │    │   (Port 4010)   │    │ (Port 8080)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   File Storage  │
                    │   /data/signed  │
                    └─────────────────┘
```

## 📦 Installation Steps

### 1. Prepare Environment

```bash
# Create deployment directory
sudo mkdir -p /opt/signing-orchestrator
cd /opt/signing-orchestrator

# Create data directories
sudo mkdir -p /data/signed /var/log/signing-orchestrator
sudo chown -R 1001:1001 /data/signed /var/log/signing-orchestrator

# Clone or copy orchestrator files
# (Copy all files from signing-orchestrator directory)
```

### 2. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit configuration
nano .env
```

**Required Configuration:**

```bash
# Application Settings
APP_PORT=4010
APP_BASE_URL=https://sign.kredit.my
NODE_ENV=production

# DocuSeal Integration
DOCUSEAL_BASE_URL=https://sign.kredit.my:3001
DOCUSEAL_WEBHOOK_HMAC_SECRET=your-webhook-secret-here
DOCUSEAL_API_TOKEN=your-docuseal-api-token

# MyTrustSigner Agent Configuration
MTSA_ENV=pilot  # or 'prod'
MTSA_WSDL_PILOT=http://mtsa-pilot:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl
MTSA_WSDL_PROD=http://mtsa-prod:8080/MTSA/MyTrustSignerAgentWSAPv2?wsdl
MTSA_SOAP_USERNAME=your-soap-username
MTSA_SOAP_PASSWORD=your-soap-password

# File Storage
SIGNED_FILES_DIR=/data/signed
SIGNED_FILES_HOST_DIR=/data/signed
LOGS_HOST_DIR=/var/log/signing-orchestrator

# Security
CORS_ORIGINS=https://sign.kredit.my,https://api.kredit.my
```

### 3. Network Configuration

**Connect to DocuSeal Network:**

```bash
# Check existing DocuSeal network
docker network ls | grep docuseal

# If DocuSeal uses custom network, update docker-compose.yml:
# networks:
#   docuseal-network:
#     external: true
#     name: your-docuseal-network-name
```

### 4. Deploy Services

**Production Deployment:**

```bash
# Build and start services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f signing-orchestrator
```

**With Production MTSA:**

```bash
# Start with production profile
docker-compose --profile production up -d
```

### 5. Verify Deployment

```bash
# Health check
curl http://localhost:4010/health

# Detailed health check
curl http://localhost:4010/health/detailed

# Test SOAP connectivity
curl http://localhost:4010/health/ready
```

## 🔧 Configuration Details

### Docker Compose Networks

The orchestrator requires access to:

1. **DocuSeal Network**: For webhook communication
2. **MTSA Network**: For SOAP API calls
3. **External Network**: For outbound CRL/OCSP validation

### Volume Mounts

```yaml
volumes:
  # Signed PDFs storage
  - /data/signed:/data/signed
  
  # Application logs
  - /var/log/signing-orchestrator:/var/log/signing-orchestrator
  
  # Optional: Custom certificates
  - /etc/ssl/certs:/etc/ssl/certs:ro
```

### Environment-Specific Settings

**Development:**
```bash
MTSA_ENV=pilot
LOG_LEVEL=debug
CORS_ORIGINS=*
RATE_LIMIT_MAX_REQUESTS=1000
```

**Production:**
```bash
MTSA_ENV=prod
LOG_LEVEL=info
CORS_ORIGINS=https://sign.kredit.my,https://api.kredit.my
RATE_LIMIT_MAX_REQUESTS=100
```

## 🌐 Nginx Configuration

### Reverse Proxy Setup

Add to your Nginx configuration:

```nginx
# Signing Orchestrator API
location /api/signing/ {
    proxy_pass http://localhost:4010/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Increase timeouts for signing operations
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Webhook endpoint (if exposing publicly)
location /webhooks/docuseal {
    proxy_pass http://localhost:4010/webhooks/docuseal;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Preserve original body for HMAC verification
    proxy_request_buffering off;
}

# Health checks
location /health/orchestrator {
    proxy_pass http://localhost:4010/health;
    access_log off;
}
```

### SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name sign.kredit.my;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    # Include orchestrator locations here
}
```

## 🔐 Security Configuration

### Firewall Rules

```bash
# Allow orchestrator port (internal only)
sudo ufw allow from 192.168.0.0/24 to any port 4010

# Allow MTSA SOAP (internal only)
sudo ufw allow from 172.20.0.0/16 to any port 8080

# Allow outbound for CRL/OCSP
sudo ufw allow out 80
sudo ufw allow out 443
```

### Docker Security

```yaml
# In docker-compose.yml
services:
  signing-orchestrator:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    user: "1001:1001"
```

## 📊 Monitoring Setup

### Log Management

**Logrotate Configuration:**

```bash
# Create /etc/logrotate.d/signing-orchestrator
/var/log/signing-orchestrator/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 1001 1001
    postrotate
        docker-compose -f /opt/signing-orchestrator/docker-compose.yml kill -s USR1 signing-orchestrator
    endscript
}
```

### Health Monitoring

**Systemd Service for Health Checks:**

```bash
# Create /etc/systemd/system/orchestrator-health.service
[Unit]
Description=Signing Orchestrator Health Check
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -f http://localhost:4010/health
User=nobody

# Create /etc/systemd/system/orchestrator-health.timer
[Unit]
Description=Run Signing Orchestrator Health Check
Requires=orchestrator-health.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target

# Enable timer
sudo systemctl enable orchestrator-health.timer
sudo systemctl start orchestrator-health.timer
```

### Metrics Collection

**Prometheus Integration:**

```yaml
# Add to docker-compose.yml
services:
  signing-orchestrator:
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=4010"
      - "prometheus.io/path=/metrics"
```

## 🔄 Backup and Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup-orchestrator.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/signing-orchestrator"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup signed PDFs
tar -czf $BACKUP_DIR/signed-pdfs-$DATE.tar.gz /data/signed/

# Backup configuration
cp /opt/signing-orchestrator/.env $BACKUP_DIR/env-$DATE.backup

# Backup logs (last 7 days)
find /var/log/signing-orchestrator -name "*.log" -mtime -7 -exec cp {} $BACKUP_DIR/ \;

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Recovery Procedure

```bash
# Stop services
docker-compose down

# Restore signed PDFs
tar -xzf backup/signed-pdfs-YYYYMMDD_HHMMSS.tar.gz -C /

# Restore configuration
cp backup/env-YYYYMMDD_HHMMSS.backup /opt/signing-orchestrator/.env

# Fix permissions
sudo chown -R 1001:1001 /data/signed

# Restart services
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

**Service Won't Start:**
```bash
# Check Docker logs
docker-compose logs signing-orchestrator

# Check port conflicts
netstat -tlnp | grep 4010

# Verify environment variables
docker-compose config
```

**SOAP Connection Failed:**
```bash
# Test MTSA connectivity
docker exec signing-orchestrator curl -f http://mtsa-pilot:8080/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl

# Check network connectivity
docker network inspect signing-orchestrator_mtsa-network
```

**Storage Permission Issues:**
```bash
# Fix ownership
sudo chown -R 1001:1001 /data/signed /var/log/signing-orchestrator

# Check disk space
df -h /data
```

**Webhook Verification Failed:**
```bash
# Verify HMAC secret matches DocuSeal
# Check webhook payload format in logs
docker-compose logs signing-orchestrator | grep webhook
```

### Debug Mode

```bash
# Enable debug logging
echo "LOG_LEVEL=debug" >> .env
docker-compose up -d

# Follow debug logs
docker-compose logs -f signing-orchestrator
```

## 📈 Performance Tuning

### Resource Limits

```yaml
# In docker-compose.yml
services:
  signing-orchestrator:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### Scaling

```bash
# Scale orchestrator instances
docker-compose up -d --scale signing-orchestrator=3

# Use load balancer (Nginx upstream)
upstream orchestrator {
    server localhost:4010;
    server localhost:4011;
    server localhost:4012;
}
```

## 🔄 Updates and Maintenance

### Update Procedure

```bash
# Backup current deployment
./backup-orchestrator.sh

# Pull new image/code
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Verify health
curl http://localhost:4010/health/detailed
```

### Maintenance Tasks

**Weekly:**
- Check disk space usage
- Review error logs
- Verify backup completion

**Monthly:**
- Update Docker images
- Rotate old signed PDFs
- Review security logs

**Quarterly:**
- Update SSL certificates
- Review and update configurations
- Performance optimization review

## 📞 Support

For deployment issues:

1. Check logs with correlation IDs
2. Verify all prerequisites are met
3. Test individual components
4. Contact system administrator with specific error messages

---

**Next Steps:** After successful deployment, configure DocuSeal webhooks and test the complete signing workflow.
