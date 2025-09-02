# DocuSeal On-Premises Deployment

This directory contains the Docker-based deployment setup for DocuSeal, a self-hosted document signing platform integrated with Kredit.my's loan processing system.

## 🏗️ Architecture

```
Internet → Nginx Proxy → DocuSeal App → PostgreSQL Database
                    ↓
               Local File Storage
```

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Navigate to the docuseal-onprem directory
cd docuseal-onprem

# Copy environment template
cp env.example .env

# Edit configuration (required before first run)
nano .env
```

### 2. Deploy

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy DocuSeal
./scripts/deploy.sh
```

### 3. Access

- **DocuSeal UI**: http://localhost:8080
- **Direct Access**: http://localhost:3001
- **Database**: localhost:5433

## 📁 Directory Structure

```
docuseal-onprem/
├── docker-compose.yml          # Main container orchestration
├── env.example                 # Environment template
├── nginx/
│   ├── nginx.conf             # Reverse proxy configuration
│   └── ssl/                   # TLS certificates (future)
├── postgres/
│   ├── init/                  # Database initialization scripts
│   └── backups/               # Database backups
├── storage/
│   ├── documents/             # Document storage
│   └── signed-agreements/     # Signed document storage
├── scripts/
│   ├── deploy.sh              # Deployment script
│   ├── backup.sh              # Database backup script
│   └── restore.sh             # Database restore script
└── logs/
    └── nginx/                 # Nginx access/error logs
```

## ⚙️ Configuration

### Environment Variables (.env)

**Required Settings:**
- `POSTGRES_PASSWORD`: Database password
- `SECRET_KEY_BASE`: Application secret (auto-generated if not set)

**Optional Settings:**
- `SMTP_*`: Email configuration for invites/notifications
- `WEBHOOK_URL`: For future signing orchestrator integration
- `DOCUSEAL_HOST`: Hostname for the application

### SMTP Configuration

For email functionality, configure these variables in `.env`:

```bash
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_DOMAIN=yourdomain.com
SMTP_FROM=noreply@yourdomain.com
```

## 🗄️ Database Management

### Backup Database

```bash
./scripts/backup.sh
```

Backups are stored in `postgres/backups/` with automatic cleanup (keeps 7 days).

### Restore Database

```bash
./scripts/restore.sh <backup_file>
```

### Manual Database Access

```bash
# Connect to PostgreSQL
docker compose exec docuseal-postgres psql -U docuseal -d docuseal

# Or from outside container
psql -h localhost -p 5433 -U docuseal -d docuseal
```

## 🔧 Management Commands

### Container Management

```bash
# View status
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop all services
docker compose down

# Update images and restart
docker compose pull && docker compose up -d
```

### Storage Management

```bash
# View storage usage
du -sh storage/

# Check document storage
ls -la storage/documents/

# Check signed agreements
ls -la storage/signed-agreements/
```

## 🔍 Monitoring & Troubleshooting

### Health Checks

```bash
# Check nginx proxy
curl http://localhost:8080/health

# Check DocuSeal app
curl http://localhost:3001/health

# Check database
docker compose exec docuseal-postgres pg_isready -U docuseal -d docuseal
```

### Common Issues

**Container won't start:**
```bash
# Check logs
docker compose logs docuseal
docker compose logs docuseal-postgres

# Check disk space
df -h

# Check permissions
ls -la storage/
```

**Database connection issues:**
```bash
# Check database status
docker compose ps docuseal-postgres

# Check database logs
docker compose logs docuseal-postgres

# Test connection
docker compose exec docuseal-postgres psql -U docuseal -d docuseal -c "SELECT version();"
```

## 🔐 Security Considerations

### Development Environment
- Uses HTTP (port 8080)
- Default passwords in env.example
- No rate limiting beyond nginx basic config

### Production Recommendations
- Enable HTTPS with proper certificates
- Change all default passwords
- Configure firewall rules
- Enable additional nginx security features
- Set up log monitoring
- Configure backup to external storage (NAS)

## 🔗 Integration Points

### Future Cloud Server Integration

The deployment is prepared for integration with the cloud-hosted backend:

1. **API Endpoints**: DocuSeal API accessible via nginx proxy
2. **Webhook Ready**: Configured for signing orchestrator callbacks
3. **Secure Storage**: Documents stored locally with backup capability
4. **Database Isolation**: Separate database from main application

### Signing Orchestrator Integration

When ready to implement the Malaysian CA integration:

1. Add signing orchestrator service to docker-compose.yml
2. Configure webhook endpoints in DocuSeal
3. Update nginx routing for internal service communication
4. Implement API endpoints for cloud server communication

## 📝 Logs

### Access Logs
- Nginx: `logs/nginx/access.log`
- DocuSeal: `docker compose logs docuseal`
- Database: `docker compose logs docuseal-postgres`

### Log Rotation

Logs are automatically rotated by Docker. For production, consider:
- Configuring logrotate
- Shipping logs to centralized logging
- Setting up alerts for errors

## 🆘 Support

For issues related to:
- **DocuSeal functionality**: Check [DocuSeal documentation](https://docs.docuseal.co/)
- **Docker/deployment**: Check container logs and this README
- **Integration**: Refer to API documentation in main project

## 🔄 Updates

To update DocuSeal to the latest version:

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d

# Check version
curl -s http://localhost:3001/api/version
```

## 📦 Backup Strategy

### Automated Backups

Set up cron job for regular backups:

```bash
# Add to crontab (run daily at 2 AM)
0 2 * * * cd /path/to/docuseal-onprem && ./scripts/backup.sh >> logs/backup.log 2>&1
```

### NAS Integration

Uncomment and configure the NAS section in `scripts/backup.sh` to automatically copy backups to network storage.
