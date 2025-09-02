# DocuSeal Domain Deployment Guide
## Setup for sign.kredit.my

Since you have configured `sign.kredit.my` to point to your on-premises server, this guide provides the domain-specific configuration and deployment steps.

---

## 🌐 **What Changes with Domain Usage**

### **Key Differences from IP-based Setup:**

1. **Standard Ports**: Uses ports 80/443 instead of 8080/8443
2. **SSL Required**: HTTPS is essential for production domain usage
3. **URL Generation**: DocuSeal generates proper domain-based URLs
4. **Email Links**: All email links will use `https://sign.kredit.my`
5. **Webhook URLs**: Your backend can use the domain for callbacks
6. **SEO/Professional**: Clean URLs for professional appearance

---

## 📋 **Updated Configuration Variables**

### **Critical Changes in `.env`:**

```bash
# Domain Configuration (REQUIRED)
DOCUSEAL_HOST=sign.kredit.my
FORCE_SSL=true
RAILS_FORCE_SSL=true
DEFAULT_URL_HOST=sign.kredit.my
DEFAULT_URL_PORT=443

# Standard Ports for Domain
HTTP_PORT=80          # Standard HTTP port
HTTPS_PORT=443        # Standard HTTPS port

# Email Configuration (Updated for domain)
SMTP_DOMAIN=kredit.my
SMTP_FROM=noreply@kredit.my

# Webhook URL (Updated for your backend)
WEBHOOK_URL=https://api.kredit.my/api/webhook/docuseal
```

---

## 🚀 **Deployment Steps for Domain**

### **Step 1: Basic Deployment**

Follow the standard deployment process first:

```bash
# Transfer files
scp docuseal-complete-deployment-kit.tar.gz user@your-server:/home/user/

# Extract and install
tar -xzf docuseal-complete-deployment-kit.tar.gz
./install-docuseal-production.sh
```

### **Step 2: Configure for Domain**

```bash
# Use domain-specific environment
cp docuseal-production-domain.env docuseal-onprem/.env

# Edit configuration
nano docuseal-onprem/.env
```

**REQUIRED Updates:**
- ✅ `POSTGRES_PASSWORD` - Strong password
- ✅ `DOCUSEAL_HOST=sign.kredit.my`
- ✅ `FORCE_SSL=true`
- ✅ Email settings (optional but recommended)

### **Step 3: SSL Certificate Setup**

```bash
# Run SSL setup script
./setup-ssl-domain.sh
```

This script will:
- Install Certbot (if needed)
- Generate Let's Encrypt SSL certificate
- Configure nginx for HTTPS
- Set up automatic renewal
- Update Docker configuration for domain

### **Step 4: Verify Domain Access**

After SSL setup, test access:

- **Primary URL**: `https://sign.kredit.my`
- **Health Check**: `https://sign.kredit.my/health`
- **HTTP Redirect**: `http://sign.kredit.my` → `https://sign.kredit.my`

---

## 🔐 **SSL Configuration Details**

### **Automatic Certificate Generation**

The SSL setup script will:

1. **Stop nginx** temporarily
2. **Generate certificate** using Let's Encrypt
3. **Install certificate** in nginx/ssl/
4. **Configure nginx** for HTTPS
5. **Set up auto-renewal** (runs monthly)

### **Certificate Files Location**

```bash
docuseal-onprem/nginx/ssl/
├── sign.kredit.my.crt    # SSL certificate
└── sign.kredit.my.key    # Private key
```

### **Auto-Renewal Setup**

```bash
# Cron job added automatically
0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'cd /path/to/docuseal-onprem && docker compose restart nginx'
```

---

## 🌐 **Network Configuration**

### **Port Requirements**

| Port | Service | Access | Notes |
|------|---------|--------|-------|
| 80 | HTTP | Public | Redirects to HTTPS |
| 443 | HTTPS | Public | Main DocuSeal interface |
| 5433 | PostgreSQL | Local only | Database access |
| 3001 | DocuSeal Direct | Local only | Debug/direct access |

### **Firewall Configuration**

```bash
# Ubuntu/UFW
sudo ufw allow 80/tcp comment "HTTP for SSL renewal"
sudo ufw allow 443/tcp comment "HTTPS for DocuSeal"

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 📧 **Email Integration with Domain**

### **Updated SMTP Configuration**

```bash
# In .env file
SMTP_DOMAIN=kredit.my
SMTP_FROM=noreply@kredit.my
SMTP_USERNAME=noreply@kredit.my
SMTP_PASSWORD=your_app_password
```

### **Email Template Updates**

All DocuSeal emails will now use:
- **Sender**: `noreply@kredit.my`
- **Links**: `https://sign.kredit.my/...`
- **Professional branding** with your domain

---

## 🔗 **Backend Integration Updates**

### **Webhook Configuration**

Update your main Kredit.my backend to:

```bash
# Environment variable
WEBHOOK_URL=https://api.kredit.my/api/webhook/docuseal
```

### **API Endpoints**

Your backend can now call:
- **Base URL**: `https://sign.kredit.my/api`
- **Auth**: API tokens from DocuSeal admin
- **Headers**: Standard HTTPS headers

### **Example Integration**

```javascript
// In your backend
const docusealAPI = 'https://sign.kredit.my/api';
const response = await fetch(`${docusealAPI}/templates`, {
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🧪 **Testing Domain Deployment**

### **Manual Tests**

```bash
# Test HTTPS access
curl -I https://sign.kredit.my

# Test HTTP redirect
curl -I http://sign.kredit.my

# Test health endpoint
curl https://sign.kredit.my/health

# Test API endpoint
curl https://sign.kredit.my/api/templates
```

### **Automated Testing**

```bash
# Run the test suite
./test-docuseal-deployment.sh
```

The test will verify:
- ✅ Domain resolves correctly
- ✅ SSL certificate is valid
- ✅ HTTP redirects to HTTPS
- ✅ All services healthy
- ✅ API endpoints responding

---

## 🔍 **Monitoring & Maintenance**

### **SSL Certificate Monitoring**

```bash
# Check certificate expiry
openssl x509 -in docuseal-onprem/nginx/ssl/sign.kredit.my.crt -noout -dates

# Test renewal process
sudo certbot renew --dry-run

# Check auto-renewal status
sudo certbot certificates
```

### **Domain-Specific Logs**

```bash
cd docuseal-onprem

# Nginx access logs (domain requests)
tail -f logs/nginx/access.log

# SSL-specific errors
grep -i ssl logs/nginx/error.log

# Certificate renewal logs
sudo tail /var/log/letsencrypt/letsencrypt.log
```

---

## 🚨 **Troubleshooting Domain Issues**

### **Common Issues**

| Problem | Cause | Solution |
|---------|-------|----------|
| Site not accessible | DNS not propagated | Wait 24-48 hours for DNS |
| SSL errors | Certificate issues | Re-run `./setup-ssl-domain.sh` |
| HTTP not redirecting | Nginx config | Check nginx-domain.conf |
| API calls failing | Mixed content | Ensure all calls use HTTPS |

### **DNS Verification**

```bash
# Check DNS resolution
dig sign.kredit.my
nslookup sign.kredit.my

# Check from external location
curl -I https://sign.kredit.my
```

### **SSL Debugging**

```bash
# Test SSL certificate
openssl s_client -connect sign.kredit.my:443 -servername sign.kredit.my

# Check certificate chain
curl -vI https://sign.kredit.my
```

---

## 📊 **Performance Considerations**

### **CDN Compatibility**

If using a CDN (Cloudflare, etc.):
- Set SSL mode to "Full (strict)"
- Enable HTTP/2
- Configure caching rules for static assets

### **Load Balancing**

For high availability:
- Multiple server instances
- Shared storage (NFS/GlusterFS)
- Database clustering
- SSL termination at load balancer

---

## 🎯 **Production Checklist for Domain**

- [ ] **DNS configured** - `sign.kredit.my` points to server
- [ ] **SSL certificate** installed and working
- [ ] **HTTP to HTTPS** redirect functional
- [ ] **All ports** properly configured (80, 443, 5433)
- [ ] **Firewall rules** updated for standard ports
- [ ] **Email integration** using domain
- [ ] **Webhook URL** updated in backend
- [ ] **Auto-renewal** configured for SSL
- [ ] **Monitoring** set up for certificate expiry
- [ ] **Backup strategy** includes SSL certificates
- [ ] **Testing completed** - all functionality works over HTTPS

---

## 🎉 **Success Criteria**

Your domain deployment is successful when:

1. ✅ **`https://sign.kredit.my`** loads DocuSeal interface
2. ✅ **HTTP redirects** automatically to HTTPS
3. ✅ **SSL certificate** shows as valid in browser
4. ✅ **Email notifications** use correct domain
5. ✅ **Document signing** works end-to-end
6. ✅ **API integration** functional with backend
7. ✅ **Webhook callbacks** received by your backend

---

## 📞 **Support Commands**

```bash
# Service status
docker compose ps

# View all logs
docker compose logs -f

# Restart services
docker compose restart

# SSL certificate status
sudo certbot certificates

# Test domain connectivity
curl -vI https://sign.kredit.my

# Check DNS
dig sign.kredit.my
```

Your DocuSeal instance will now be professionally accessible at `https://sign.kredit.my` with full SSL security and proper domain integration!
