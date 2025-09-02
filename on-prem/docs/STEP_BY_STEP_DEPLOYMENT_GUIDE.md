# DocuSeal On-Premises: Step-by-Step Deployment & Testing Guide

This guide walks you through deploying DocuSeal from your laptop to your production server and testing all functionality.

## 📋 Pre-Deployment Checklist

### On Your Laptop (Source)
- [x] DocuSeal deployment package created: `docuseal-onprem-complete.tar.gz`
- [x] Installation script ready: `install-docuseal-production.sh`
- [x] Production environment template: `docuseal-production.env`
- [x] Deployment guide available: `DOCUSEAL_PRODUCTION_DEPLOYMENT_GUIDE.md`

### Server Requirements
- [ ] Linux server (Ubuntu 20.04+, CentOS 8+, or similar)
- [ ] Minimum 4GB RAM, 20GB storage, 2 CPU cores
- [ ] Internet access for downloading Docker images
- [ ] SSH access with sudo privileges
- [ ] Ports 8080, 8443, 5433 available

---

## 🚀 PHASE 1: Server Preparation

### Step 1.1: Connect to Your Server

```bash
# Replace with your server details
ssh your-username@your-server-ip

# Example:
ssh admin@192.168.1.100
# or
ssh admin@server.yourcompany.com
```

### Step 1.2: Update System Packages

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
# or for newer versions
sudo dnf update -y
```

### Step 1.3: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

**Expected Output:**
```
Docker version 24.0.x
Docker Compose version v2.x.x
```

### Step 1.4: Configure Firewall

```bash
# Ubuntu (UFW)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 8080/tcp comment "DocuSeal HTTP"
sudo ufw allow 8443/tcp comment "DocuSeal HTTPS"
sudo ufw status

# CentOS/RHEL (FirewallD)
sudo systemctl enable firewalld
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=8443/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

---

## 📦 PHASE 2: File Transfer & Extraction

### Step 2.1: Transfer Files from Laptop to Server

**From your laptop (in the kapital directory):**

```bash
# Option A: Using SCP
scp docuseal-onprem-complete.tar.gz your-username@your-server-ip:/home/your-username/

# Option B: Using rsync (recommended)
rsync -avz --progress docuseal-onprem-complete.tar.gz your-username@your-server-ip:/home/your-username/

# Example:
scp docuseal-onprem-complete.tar.gz admin@192.168.1.100:/home/admin/
```

**Verify transfer completed:**
```bash
# On server
ls -la ~/docuseal-onprem-complete.tar.gz
```

### Step 2.2: Extract Deployment Package

**On your server:**

```bash
cd ~
tar -xzf docuseal-onprem-complete.tar.gz
ls -la
```

**Expected output:**
```
docuseal-onprem/
install-docuseal-production.sh
docuseal-production.env
DOCUSEAL_PRODUCTION_DEPLOYMENT_GUIDE.md
```

### Step 2.3: Make Installation Script Executable

```bash
chmod +x install-docuseal-production.sh
```

---

## ⚙️ PHASE 3: Environment Configuration

### Step 3.1: Copy Production Environment Template

```bash
cp docuseal-production.env docuseal-onprem/.env
cd docuseal-onprem
```

### Step 3.2: Configure Critical Variables

```bash
# Edit the environment file
nano .env
```

**REQUIRED Changes:**

1. **Database Password** (Line ~5):
   ```bash
   POSTGRES_PASSWORD=YourStrongPassword123!
   ```

2. **Server Host** (Line ~13):
   ```bash
   # For IP-based access:
   DOCUSEAL_HOST=192.168.1.100
   
   # OR for domain-based access:
   DOCUSEAL_HOST=docuseal.yourcompany.com
   ```

3. **Email Configuration** (Lines ~20-26) - OPTIONAL but recommended:
   ```bash
   SMTP_ADDRESS=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-docuseal@gmail.com
   SMTP_PASSWORD=your-app-specific-password
   SMTP_DOMAIN=yourcompany.com
   SMTP_FROM=noreply@yourcompany.com
   ```

4. **Webhook URL** (Line ~32) - For backend integration:
   ```bash
   WEBHOOK_URL=https://your-main-backend.com/api/webhook/docuseal
   ```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### Step 3.3: Verify Configuration

```bash
# Check your configuration
cat .env | grep -v "^#" | grep -v "^$"
```

---

## 🚀 PHASE 4: Deployment

### Step 4.1: Run Installation Script

```bash
cd ..
./install-docuseal-production.sh
```

**The script will:**
1. Create necessary directories
2. Generate secure SECRET_KEY_BASE (if needed)
3. Configure firewall rules
4. Pull Docker images (~2-3 minutes)
5. Start all services
6. Run health checks
7. Set up automatic backups

**Expected successful output:**
```
✅ DocuSeal Production Installation Complete!
==============================================

🌐 Access URLs:
   Primary:  http://192.168.1.100:8080
   Direct:   http://192.168.1.100:3001

🏥 Running health checks...
✅ Nginx proxy is healthy
✅ DocuSeal is responding

🔍 Service status:
NAME                  IMAGE                      STATUS
docuseal-app          docuseal/docuseal:latest   Up (healthy)
docuseal-nginx        nginx:alpine               Up (healthy)
docuseal-postgres     postgres:15-alpine         Up (healthy)
```

### Step 4.2: Verify Services are Running

```bash
cd docuseal-onprem
docker compose ps
```

**All services should show "Up (healthy)" status.**

---

## 🧪 PHASE 5: Testing & Verification

### Step 5.1: Basic Connectivity Test

```bash
# Test from server
curl http://localhost:8080/health
curl http://localhost:3001/health

# Expected output: "healthy"
```

### Step 5.2: Web Interface Access Test

**From your laptop or any computer on the network:**

1. Open web browser
2. Go to: `http://YOUR_SERVER_IP:8080`
   - Example: `http://192.168.1.100:8080`
3. You should see the DocuSeal login/setup page

### Step 5.3: Initial DocuSeal Setup

1. **Access DocuSeal**: Open `http://YOUR_SERVER_IP:8080`
2. **Create Admin Account**:
   - Click "Sign Up" or follow setup wizard
   - Enter admin email and password
   - Complete the initial setup

3. **Verify Login**:
   - Log in with your admin credentials
   - You should see the DocuSeal dashboard

### Step 5.4: Document Upload & Template Test

1. **Create a Template**:
   - In DocuSeal dashboard, click "Templates"
   - Click "New Template"
   - Upload a PDF document (test with any PDF)
   - Add signature fields
   - Save the template

2. **Test Document Signing**:
   - Click "Send Document"
   - Use the template you created
   - Enter a test email (your email)
   - Send the document

3. **Verify Email Delivery** (if SMTP configured):
   - Check your email for signing invitation
   - Click the signing link
   - Complete the signing process

### Step 5.5: Database Connectivity Test

```bash
cd docuseal-onprem

# Test database connection
docker compose exec docuseal-postgres psql -U docuseal -d docuseal -c "SELECT version();"

# Check database tables
docker compose exec docuseal-postgres psql -U docuseal -d docuseal -c "\dt"
```

### Step 5.6: File Storage Test

```bash
# Check document storage
ls -la storage/documents/
ls -la storage/signed-agreements/

# You should see files after uploading documents
```

### Step 5.7: Backup System Test

```bash
# Run manual backup
./scripts/backup.sh

# Verify backup was created
ls -la postgres/backups/

# Expected: docuseal_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Step 5.8: API Integration Test

```bash
# Test API endpoint
curl -X GET http://YOUR_SERVER_IP:8080/api/templates \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Note: You'll need to generate an API token in DocuSeal admin panel first
```

---

## 🔍 PHASE 6: Troubleshooting Common Issues

### Issue 1: Services Won't Start

```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check Docker status
systemctl status docker
```

### Issue 2: Can't Access Web Interface

```bash
# Check nginx status
curl http://localhost:8080/health

# Check firewall
sudo ufw status

# Check if ports are listening
netstat -tlnp | grep 8080
```

### Issue 3: Database Connection Failed

```bash
# Restart database
docker compose restart docuseal-postgres

# Check database logs
docker compose logs docuseal-postgres

# Wait for database to be ready
docker compose exec docuseal-postgres pg_isready -U docuseal -d docuseal
```

### Issue 4: Email Not Working

```bash
# Check SMTP settings in .env
grep SMTP .env

# Test SMTP connection (if using Gmail)
telnet smtp.gmail.com 587
```

---

## ✅ PHASE 7: Post-Deployment Tasks

### Step 7.1: SSL/HTTPS Setup (Production Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update .env
nano .env
# Set: FORCE_SSL=true
# Set: DOCUSEAL_HOST=your-domain.com

# Restart services
docker compose down && docker compose up -d
```

### Step 7.2: Configure Monitoring

```bash
# Add log monitoring script
echo '*/5 * * * * cd /home/your-username/docuseal-onprem && docker compose ps | grep -v "Up" && echo "DocuSeal service down!" | mail -s "DocuSeal Alert" admin@yourcompany.com' | crontab -
```

### Step 7.3: External Backup Setup

```bash
# Edit backup script for external storage
nano scripts/backup.sh

# Uncomment and configure NAS section at the bottom
# Example: Copy to network storage
```

### Step 7.4: Document Security Review

1. **Change default passwords**: ✅ Done by installation script
2. **Review file permissions**:
   ```bash
   ls -la storage/
   chmod 755 storage/documents
   chmod 755 storage/signed-agreements
   ```
3. **Configure access restrictions**: Update nginx.conf if needed

---

## 📊 PHASE 8: Performance & Maintenance

### Daily Monitoring Commands

```bash
cd docuseal-onprem

# Check service status
docker compose ps

# View recent logs
docker compose logs --tail=50

# Check disk usage
df -h
du -sh storage/

# Check memory usage
free -h
docker stats --no-stream
```

### Weekly Maintenance

```bash
# Update Docker images
docker compose pull
docker compose up -d

# Clean up old Docker images
docker image prune -f

# Review backup files
ls -la postgres/backups/
```

### Monthly Tasks

```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Review log files
tail -100 logs/nginx/access.log
tail -100 logs/nginx/error.log

# Check SSL certificate expiry (if using HTTPS)
openssl x509 -in nginx/ssl/docuseal.crt -noout -dates
```

---

## 🎯 Success Criteria Checklist

- [ ] All Docker containers running (3/3 healthy)
- [ ] Web interface accessible via browser
- [ ] Admin account created and can log in
- [ ] Document template created successfully
- [ ] Test document uploaded and processed
- [ ] Email notifications working (if configured)
- [ ] Database backup completed successfully
- [ ] API endpoints responding correctly
- [ ] SSL/HTTPS configured (for production)
- [ ] Firewall rules applied and tested

---

## 🆘 Emergency Procedures

### Complete System Restart

```bash
cd docuseal-onprem
docker compose down
docker compose up -d
```

### Restore from Backup

```bash
cd docuseal-onprem
./scripts/restore.sh postgres/backups/docuseal_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Rollback to Previous Version

```bash
# Stop current version
docker compose down

# Pull specific version
docker compose pull docuseal/docuseal:v1.x.x

# Start with specific version
docker compose up -d
```

---

## 📞 Support & Resources

- **Configuration File**: `docuseal-onprem/.env`
- **Log Files**: `docuseal-onprem/logs/`
- **Backup Location**: `docuseal-onprem/postgres/backups/`
- **Document Storage**: `docuseal-onprem/storage/`
- **Docker Commands**: `docker compose logs`, `docker compose ps`, `docker compose restart`

**Health Check URLs:**
- Nginx: `http://YOUR_SERVER:8080/health`
- DocuSeal: `http://YOUR_SERVER:3001/health`
- Database: `docker compose exec docuseal-postgres pg_isready -U docuseal -d docuseal`

---

## 🎉 Congratulations!

If you've completed all phases successfully, your DocuSeal on-premises deployment is ready for production use! 

**Next Steps:**
1. Integrate with your main backend via webhooks
2. Set up regular monitoring and alerts
3. Configure additional security measures as needed
4. Train users on the document signing workflow
