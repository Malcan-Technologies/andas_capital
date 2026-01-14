# On-Prem Deployment Guide

## 🚀 Quick Reference for Production Deployments

### Server Information
- **Server IP**: `100.76.8.62` (via Tailscale VPN) or accessible via Cloudflare Tunnel
- **SSH User**: `admin-kapital`
- **Connection**: `ssh admin-kapital@100.76.8.62`

### External Access
- **Signing URL**: `https://sign.creditxpress.com.my` (via Cloudflare Tunnel)
- **Tunnel Name**: `creditxpress-onprem`

> **Note:** External access is provided via Cloudflare Tunnel, not direct port exposure.
> See [Cloudflare Tunnel Setup Guide](docs/CLOUDFLARE_TUNNEL_SETUP.md) for details.

---

## 📋 Main Deployment Commands

### 1. Full Deployment (DocuSeal + Signing Orchestrator + MTSA)
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh deploy
```

**What it does:**
- ✅ Creates comprehensive backup (database + volumes + files)
- ✅ Syncs DocuSeal, Signing Orchestrator, and MTSA files
- ✅ Sets up environment files (.env.production)
- ✅ Deploys all services with proper configuration
- ✅ Verifies health checks and network connectivity

**Important:** This script **NOW SAFELY PRESERVES DATA** - the dangerous volume deletion has been removed!

---

### 2. Signing Orchestrator Only Deployment
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/signing-orchestrator
./deploy-auto.sh
```

**What it does:**
- ✅ Creates backup before deployment (including database)
- ✅ Copies source files to on-prem server
- ✅ Uses env.production automatically
- ✅ Rebuilds and restarts containers
- ✅ Tests health and API endpoints
- ⚠️ **SAFE**: Volume deletion line has been removed!

---

## 🔧 Environment Files Management

### Signing Orchestrator Environment
**File**: `on-prem/signing-orchestrator/.env.production`

**Key settings:**
- `NODE_ENV=production`
- `DOCUSEAL_API_URL` - DocuSeal API endpoint
- `MTSA_SOAP_ENDPOINT` - MTSA WSDL URL
- `SIGNING_ORCHESTRATOR_API_KEY` - API key for VPS communication

**To update on server:**
```bash
ssh admin-kapital@100.76.8.62
cd ~/signing-orchestrator
nano .env.production
# Make changes
docker-compose restart
```

### DocuSeal Environment
**File**: `docuseal-onprem/env.production`

**To update on server:**
```bash
ssh admin-kapital@100.76.8.62
cd ~/docuseal-onprem
nano env.production
cp env.production .env
docker-compose restart
```

---

## 🛡️ Backup & Restore

### Create Manual Backup
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh backup
```

**Backs up:**
- Application files (tar.gz)
- DocuSeal database (SQL dump)
- Signing Orchestrator agreements database (SQL dump)
- All Docker volumes (documents, uploads, storage)

**Backup location:** `~/backups/` on server

### Restore from Backup
```bash
# List available backups
./deploy-all.sh restore

# Restore specific backup
./deploy-all.sh restore full-backup-20250101_120000
```

---

## 📊 Monitoring & Status

### Check Deployment Status
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh status
```

Shows:
- All running containers
- Health checks for all services
- Network connectivity status
- Resource usage

### View Logs
```bash
# All logs
./deploy-all.sh logs

# Specific service
./deploy-all.sh logs docuseal
./deploy-all.sh logs orchestrator
```

### Direct SSH Monitoring
```bash
ssh admin-kapital@100.76.8.62

# Check containers
docker ps

# Check specific service logs
cd ~/signing-orchestrator
docker-compose logs -f signing-orchestrator

# Check database
docker exec agreements-postgres-prod psql -U agreements_user -d agreements_db -c "SELECT COUNT(*) FROM \"SignedAgreement\";"
```

---

## 🔄 Restart Services

### Restart All Services
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh restart
```

### Restart Specific Service
```bash
./deploy-all.sh restart docuseal
./deploy-all.sh restart orchestrator
```

### Manual Restart via SSH
```bash
ssh admin-kapital@100.76.8.62

# Restart signing orchestrator
cd ~/signing-orchestrator
docker-compose restart

# Restart DocuSeal
cd ~/docuseal-onprem
docker-compose restart
```

---

## 🌐 Cloudflare Tunnel (External Access)

External access to on-prem services is provided via **Cloudflare Tunnel**, which creates a secure encrypted connection without opening firewall ports.

### Current Configuration
- **Tunnel Name**: `creditxpress-onprem`
- **Hostname**: `sign.creditxpress.com.my`
- **Service**: Running as systemd service on on-prem server

### Cloudflare Dashboard Routes
Routes are configured in **Cloudflare Zero Trust Dashboard** → **Networks** → **Tunnels** → **creditxpress-onprem** → **Public Hostname**:

| Path | Service | Description |
|------|---------|-------------|
| `signing-health` | `http://localhost:4010/health` | Orchestrator health check |
| `orchestrator/*` | `http://localhost:4010` | Signing Orchestrator API |
| `api/signing/*` | `http://localhost:4010` | Signing API |
| `MTSAPilot/*` | `http://localhost:8080` | MTSA Pilot SOAP |
| `MTSA/*` | `http://localhost:8080` | MTSA Prod SOAP |
| `*` | `http://localhost:3001` | DocuSeal (catch-all) |

### Manage Cloudflare Tunnel
```bash
# Check tunnel status
ssh admin-kapital@100.76.8.62 "sudo systemctl status cloudflared"

# View tunnel logs
ssh admin-kapital@100.76.8.62 "sudo journalctl -u cloudflared -f"

# Restart tunnel
ssh admin-kapital@100.76.8.62 "sudo systemctl restart cloudflared"

# Check tunnel connections
ssh admin-kapital@100.76.8.62 "cloudflared tunnel info creditxpress-onprem"
```

### New Client Setup
For setting up Cloudflare Tunnel on a new client:
```bash
# Copy setup script to server and run
scp on-prem/scripts/setup-cloudflare-tunnel.sh admin@server:/tmp/
ssh admin@server "/tmp/setup-cloudflare-tunnel.sh --client-name CLIENT --domain client.com"
```

See full documentation: [Cloudflare Tunnel Setup Guide](docs/CLOUDFLARE_TUNNEL_SETUP.md)

---

## 🌐 Nginx Configuration (Legacy - No Longer Used)

> **Note:** Nginx is no longer required on-prem. Cloudflare Tunnel handles external routing and TLS termination.

The `docuseal-nginx` container can be removed:
```bash
docker stop docuseal-nginx && docker rm docuseal-nginx
```

---

## 🔗 Network Connectivity

### Fix MTSA Network Issues
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh fix-network
```

This ensures:
- MTSA container is on the orchestrator network
- Orchestrator can ping MTSA
- WSDL endpoint is accessible

---

## 🧹 Cleanup

### Remove Old Docker Resources
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh cleanup
```

Removes:
- Unused Docker images
- Unused volumes (only unused!)
- Unused networks

**Safe:** Only removes unused resources, not active data!

---

## ⚠️ Important Safety Notes

### Data Protection
1. **Always create backups before major changes**
   ```bash
   ./deploy-all.sh backup
   ```

2. **The deployment scripts now protect your data:**
   - Automatic database backups before deployment
   - Volume deletion lines have been removed
   - Safe recreation using `--force-recreate` with named volumes

3. **Never manually delete Docker volumes unless you're 100% sure:**
   ```bash
   # ❌ DON'T DO THIS unless you want to lose data
   docker volume rm signing-orchestrator_agreements-postgres-data
   ```

### Database Safety
- Signing orchestrator database is in a named Docker volume: `signing-orchestrator_agreements-postgres-data`
- DocuSeal database is in: `docuseal-onprem_postgres-data`
- Both are **preserved** during deployments and container recreations

### Best Practices
1. **Before deployment:**
   - Run `./deploy-all.sh backup`
   - Verify VPS backend can still reach orchestrator

2. **After deployment:**
   - Run `./deploy-all.sh status`
   - Test health endpoints
   - Test a signing workflow in admin panel

3. **If something goes wrong:**
   - Run `./deploy-all.sh logs` to diagnose
   - Run `./deploy-all.sh restore <backup-name>` if needed

---

## 📚 File Locations

### Local Development
```
/Users/ivan/Documents/creditxpress/
├── on-prem/
│   ├── scripts/
│   │   └── deploy-all.sh          ← Main deployment script
│   ├── signing-orchestrator/
│   │   ├── deploy-auto.sh         ← Orchestrator-only deployment
│   │   └── .env.production        ← Production environment
│   └── docuseal/
│       └── env.production         ← DocuSeal production env
```

### On-Prem Server
```
/home/admin-kapital/
├── backups/                       ← All backups stored here
│   └── full-backup-*/
├── signing-orchestrator/          ← Orchestrator application
│   ├── .env                       ← Active environment (from .env.production)
│   └── docker-compose.yml
├── docuseal-onprem/              ← DocuSeal application
│   ├── .env                       ← Active environment (from env.production)
│   └── docker-compose.yml
└── kapital/                       ← Persistent data storage
    ├── agreements/
    │   ├── signed/                ← Signed PDFs
    │   ├── original/              ← Original PDFs
    │   └── stamped/               ← Stamped PDFs
    └── logs/                      ← Application logs
```

---

## 🎯 Common Scenarios

### Scenario 1: Update Signing Orchestrator Code
```bash
# Make changes locally
cd /Users/ivan/Documents/creditxpress/on-prem/signing-orchestrator

# Deploy to production
./deploy-auto.sh
```

### Scenario 2: Update Environment Variables
```bash
# Option A: Edit locally then deploy
nano /Users/ivan/Documents/creditxpress/on-prem/signing-orchestrator/.env.production
cd /Users/ivan/Documents/creditxpress/on-prem/signing-orchestrator
./deploy-auto.sh

# Option B: Edit directly on server (faster for quick changes)
ssh admin-kapital@100.76.8.62
cd ~/signing-orchestrator
nano .env.production
cp .env.production .env
docker-compose restart
```

### Scenario 3: Deploy Everything from Scratch
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh deploy
```

### Scenario 4: Emergency Restore
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts

# List backups
./deploy-all.sh restore

# Restore the most recent one
./deploy-all.sh restore full-backup-<timestamp>
```

---

## 🔐 API Keys & Secrets

### Signing Orchestrator API Key
Used by VPS backend to communicate with on-prem orchestrator.

**Backend `.env`:**
```
SIGNING_ORCHESTRATOR_URL=http://100.76.8.62:4010
SIGNING_ORCHESTRATOR_API_KEY=<key>
```

**Orchestrator `.env.production`:**
```
SIGNING_ORCHESTRATOR_API_KEY=<same-key>
```

**To rotate:**
1. Generate new key
2. Update both VPS backend and orchestrator .env
3. Restart both services

---

## 📞 Troubleshooting

### Health Check Failing
```bash
ssh admin-kapital@100.76.8.62

# Check container status
docker ps
docker-compose logs signing-orchestrator

# Restart if needed
cd ~/signing-orchestrator
docker-compose restart
```

### Database Empty After Deployment
**This should no longer happen!** The deployment scripts now protect data.

If it does happen:
1. Check if backup was created: `ls ~/backups/`
2. Restore from backup: `./deploy-all.sh restore <backup-name>`

### MTSA Network Not Working
```bash
cd /Users/ivan/Documents/creditxpress/on-prem/scripts
./deploy-all.sh fix-network
```

### Can't Connect to Server
```bash
# Check Tailscale connection
tailscale status | grep 100.76.8.62

# Restart Tailscale if needed
sudo tailscale down
sudo tailscale up
```

---

## ✅ Pre-Deployment Checklist

Before running any deployment:
- [ ] VPS backend is running and healthy
- [ ] Tailscale connection is active
- [ ] You have recent backups
- [ ] You know the rollback plan
- [ ] Environment files are up to date
- [ ] You're not in the middle of active signing operations

---

## 📅 Maintenance Schedule

### Weekly
- Check backup retention (keep last 10)
- Review Docker disk usage
- Check logs for errors

### Monthly
- Test restore procedure
- Update dependencies if needed
- Review and rotate API keys if necessary

### Before Major Updates
- Full backup
- Test in development first
- Plan maintenance window
- Notify users if needed

---

## 🆘 Emergency Contacts & Resources

### Important URLs
- **DocuSeal**: https://sign.kredit.my
- **Orchestrator Health**: http://100.76.8.62:4010/health
- **VPS Backend**: https://api.kredit.my

### Documentation
- [Signing Orchestrator README](../signing-orchestrator/README.md)
- [DocuSeal Deployment Guide](../docuseal/DEPLOYMENT.md)
- [Platform Architecture](../../README.md)

---

**Last Updated:** October 21, 2025
**Author:** Ivan / Kredit Platform Team

