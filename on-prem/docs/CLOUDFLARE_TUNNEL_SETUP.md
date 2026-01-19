# Cloudflare Tunnel Setup for On-Prem Services

This guide covers setting up Cloudflare Tunnel to expose on-prem signing services (DocuSeal, Signing Orchestrator, MTSA) to the internet securely without opening firewall ports.

## Overview

Cloudflare Tunnel creates an encrypted connection from your on-prem server to Cloudflare's edge network, allowing secure access to internal services without exposing them directly to the internet.

### Architecture

```
Internet → Cloudflare Edge → Cloudflare Tunnel → On-Prem Server
                                                    ├── DocuSeal (port 3001)
                                                    ├── Signing Orchestrator (port 4010)
                                                    └── MTSA (port 8080)
```

### Benefits over Tailscale/VPN

- No VPN client needed for end users
- Cloudflare handles TLS termination
- Built-in DDoS protection
- Access via standard HTTPS URLs
- No need to manage SSL certificates on-prem

---

## Prerequisites

1. **Cloudflare Account** with your domain added (e.g., `clientdomain.com`)
2. **On-prem server** with Docker running the services:
   - `docuseal-app` on port 3001
   - `signing-orchestrator` on port 4010
   - `mtsa-pilot-prod` on port 8080
3. **SSH access** to the on-prem server

---

## Installation Steps

### Step 1: Install cloudflared

SSH into the on-prem server and install cloudflared:

```bash
# Download and install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
rm cloudflared.deb

# Verify installation
cloudflared --version
```

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser URL. Log in with your Cloudflare account and select the domain you want to use. A certificate will be saved to `~/.cloudflared/cert.pem`.

### Step 3: Create the Tunnel

```bash
# Create a tunnel (replace CLIENT_NAME with client identifier)
cloudflared tunnel create CLIENT_NAME-onprem

# Note the Tunnel ID from the output (e.g., cd007349-a390-4c53-b1d8-3a44566b05e2)
```

### Step 4: Create DNS Route

```bash
# Route the subdomain to the tunnel (replace with your domain)
cloudflared tunnel route dns CLIENT_NAME-onprem sign.clientdomain.com
```

### Step 5: Configure Tunnel Routes in Cloudflare Dashboard

Go to **Cloudflare Zero Trust Dashboard** → **Networks** → **Tunnels** → Select your tunnel → **Public Hostname** tab.

Add the following routes **in this exact order** (order matters!):

| # | Subdomain | Domain | Path | Service | Description |
|---|-----------|--------|------|---------|-------------|
| 1 | sign | clientdomain.com | `orchestrator/*` | `http://localhost:4010` | Health checks |
| 2 | sign | clientdomain.com | `api/otp` | `http://localhost:4010` | OTP requests |
| 3 | sign | clientdomain.com | `api/certificate` | `http://localhost:4010` | Certificate issuance |
| 4 | sign | clientdomain.com | `api/cert/*` | `http://localhost:4010` | Certificate lookup |
| 5 | sign | clientdomain.com | `api/enroll` | `http://localhost:4010` | User enrollment |
| 6 | sign | clientdomain.com | `api/sign` | `http://localhost:4010` | PDF signing |
| 7 | sign | clientdomain.com | `api/verify` | `http://localhost:4010` | Signature verification |
| 8 | sign | clientdomain.com | `api/verify-cert-pin` | `http://localhost:4010` | PIN verification |
| 9 | sign | clientdomain.com | `api/revoke` | `http://localhost:4010` | Certificate revocation |
| 10 | sign | clientdomain.com | `api/pki/*` | `http://localhost:4010` | PKI operations |
| 11 | sign | clientdomain.com | `api/signed/*` | `http://localhost:4010` | Signed document access |
| 12 | sign | clientdomain.com | `api/agreements` | `http://localhost:4010` | Agreement listing |
| 13 | sign | clientdomain.com | `api/admin/*` | `http://localhost:4010` | Admin operations |
| 14 | sign | clientdomain.com | `MTSAPilot/*` | `http://localhost:8080` | MTSA Pilot SOAP |
| 15 | sign | clientdomain.com | `MTSA/*` | `http://localhost:8080` | MTSA Prod SOAP |
| 16 | sign | clientdomain.com | `api/reset-cert-pin` | `http://localhost:4010` | PIN reset |
| 17 | sign | clientdomain.com | `*` | `http://localhost:3001` | DocuSeal (catch-all) |

**⚠️ Important:** The catch-all `*` route MUST be last. Cloudflare evaluates routes in order, so specific paths must come before the catch-all.

**Minimum Required Routes (for OTP/Certificate flow):**

If you only need basic certificate signing functionality, add at minimum:
- `orchestrator/*` → `http://localhost:4010` (health checks)
- `api/otp` → `http://localhost:4010` (OTP requests)
- `api/certificate` → `http://localhost:4010` (certificate issuance)
- `api/cert/*` → `http://localhost:4010` (certificate lookup)
- `api/enroll` → `http://localhost:4010` (enrollment)

**Note:** The Signing Orchestrator has `/orchestrator/health` mounted internally, so the health check at `https://sign.clientdomain.com/orchestrator/health` works via the `orchestrator/*` route.

### Step 6: Install as System Service

```bash
# Create system config directory
sudo mkdir -p /etc/cloudflared

# Get your tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep onprem | awk '{print $1}')

# Copy credentials to system directory
sudo cp ~/.cloudflared/cert.pem /etc/cloudflared/
sudo cp ~/.cloudflared/${TUNNEL_ID}.json /etc/cloudflared/

# Create minimal config (routes are managed in dashboard)
sudo tee /etc/cloudflared/config.yml << EOF
tunnel: ${TUNNEL_ID}
credentials-file: /etc/cloudflared/${TUNNEL_ID}.json
EOF

# Install and start the service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Verify it's running
sudo systemctl status cloudflared
```

### Step 7: Verify Connectivity

Test all endpoints:

```bash
# DocuSeal (should return HTML)
curl -s https://sign.clientdomain.com/ | head -5

# Signing Orchestrator health (should return JSON with status)
curl -s https://sign.clientdomain.com/orchestrator/health

# MTSA WSDL (should return XML)
curl -s https://sign.clientdomain.com/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl | head -5
```

---

## Removing Nginx (Optional)

Since Cloudflare Tunnel handles routing and TLS, the on-prem nginx container is no longer needed:

```bash
# Stop and remove nginx container
docker stop docuseal-nginx
docker rm docuseal-nginx

# Optionally, remove from docker-compose.yml to prevent it from starting again
```

---

## Backend Configuration

Update the backend environment variables to use the Cloudflare tunnel URL:

```bash
# backend/.env (production)
SIGNING_ORCHESTRATOR_URL=https://sign.clientdomain.com
```

The health check in `backend/src/api/admin.ts` uses these URLs:
- DocuSeal: `https://sign.clientdomain.com/`
- Signing Orchestrator: `https://sign.clientdomain.com/orchestrator/health`
- MTSA: `https://sign.clientdomain.com/MTSAPilot/MyTrustSignerAgentWSAPv2?wsdl`

---

## Troubleshooting

### Tunnel not connecting

```bash
# Check tunnel status
cloudflared tunnel info CLIENT_NAME-onprem

# Check service logs
sudo journalctl -u cloudflared -f

# Verify credentials exist
ls -la /etc/cloudflared/
```

### Routes returning 404

1. **Check route order** - Specific paths must be above catch-all `*`
2. **Verify service is running** - `docker ps` to check containers
3. **Test locally first** - `curl http://localhost:PORT/path`

### 502 Bad Gateway

- Service is not running or not reachable on the specified port
- Check Docker container status: `docker ps`
- Check if port is exposed: `docker port CONTAINER_NAME`

### DNS not resolving

```bash
# Verify DNS record exists
dig sign.clientdomain.com

# Should return Cloudflare IPs (104.x.x.x or 172.x.x.x)
```

---

## Quick Reference

### Useful Commands

```bash
# List tunnels
cloudflared tunnel list

# Get tunnel info
cloudflared tunnel info TUNNEL_NAME

# Check service status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f

# Restart tunnel
sudo systemctl restart cloudflared

# Test tunnel manually (for debugging)
cloudflared tunnel run TUNNEL_NAME
```

### File Locations

| File | Purpose |
|------|---------|
| `/etc/cloudflared/config.yml` | Tunnel configuration |
| `/etc/cloudflared/TUNNEL_ID.json` | Tunnel credentials |
| `/etc/cloudflared/cert.pem` | Cloudflare certificate |
| `~/.cloudflared/` | User-level config (used during setup) |

### Port Mapping

| Service | Internal Port | Cloudflare Paths |
|---------|--------------|------------------|
| DocuSeal | 3001 | `/*` (catch-all) |
| Signing Orchestrator | 4010 | `/orchestrator/*`, `/api/otp`, `/api/certificate`, `/api/cert/*`, `/api/enroll`, `/api/sign`, `/api/verify`, `/api/verify-cert-pin`, `/api/revoke`, `/api/pki/*`, `/api/signed/*`, `/api/agreements`, `/api/admin/*` |
| MTSA | 8080 | `/MTSAPilot/*`, `/MTSA/*` |

---

## Security Considerations

1. **API Keys**: The Signing Orchestrator uses `X-API-Key` header for authentication
2. **CORS**: Configure `CORS_ORIGINS` in orchestrator to allow your domains
3. **Rate Limiting**: Cloudflare provides built-in rate limiting (configure in dashboard)
4. **Access Policies**: Use Cloudflare Access to add authentication if needed

---

**Last Updated:** January 2026
**Author:** Kredit Platform Team
