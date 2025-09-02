# ⚙️ Operational Guide — On-Prem Digital Signing (Docuseal + MyTrustSigner + Orchestrator)

## 1. System Overview
- **Docuseal** (Docker, port 3001) → signer frontend (`https://sign.kredit.my:3001`)
- **MyTrustSigner Agent** (Docker, internal only) → SOAP API for PKI cert + PDF signing
- **Signing Orchestrator** (Docker, port 4010) → glue service:
  - Consumes Docuseal webhooks
  - Calls MyTrustSigner SOAP
  - Writes signed PDFs to `/data/signed`
- All three containers run on the **same on-prem physical server**

---

## 2. DNS Setup
- Subdomain: `sign.kredit.my`
- DNS A/AAAA record → public static IP of on-prem router/firewall
- TTL: 300s (fast updates if IP ever changes)
- Optional: CAA record for Let's Encrypt → `0 issue "letsencrypt.org"`

---

## 3. Firewall & Router Configuration
- **Inbound (WAN → on-prem)**:
  - Allow TCP 80 (only for ACME/Let's Encrypt, optional to keep open)
  - Allow TCP 443 → reverse proxy (Caddy/Traefik/Nginx)
  - Block all other inbound ports
- **Outbound**:
  - Allow SOAP container → CA endpoints (OCSP, CRL, TSA, CA APIs)
  - Allow orchestrator → CA SOAP (internal Docker net)
  - Allow orchestrator → Docuseal (internal Docker net)

---

## 4. Reverse Proxy
- Deploy **Caddy** (recommended) or Traefik/Nginx as a front container
- Routes:
  - `https://sign.kredit.my/` → Docuseal:3001
  - `https://sign.kredit.my/api/*` → Orchestrator:4010
- TLS: Let’s Encrypt (HTTP-01 via port 80) → auto-renew
- Security headers:
  - HSTS, X-Frame-Options=DENY, X-Content-Type-Options=nosniff
- Limits:
  - Max upload size: 50MB
  - Rate-limiting on login/webhook routes

---

## 5. Docker Compose Layout (high-level)
- **Services**:
  - `docuseal` (port 3001)
  - `signing-orchestrator` (port 4010)
  - `mytrustsigner-agent` (SOAP, internal only)
  - `reverse-proxy` (port 80/443)
- **Volumes**:
  - `/data/signed` → for signed PDFs (map to orchestrator + backup scripts)
  - `/var/lib/postgresql` → if Docuseal DB self-hosted
- **Networks**:
  - `internal_net` (docuseal, orchestrator, agent)
  - `public_net` (reverse proxy)

---

## 6. Secrets & Environment
- Store all secrets in `.env` (never commit):
  - SOAP `Username`, `Password`
  - Docuseal webhook HMAC secret
  - SMTP creds for Docuseal notifications
- Rotate secrets regularly
- Use Vault/Ansible if infra supports

---

## 7. Backup & Restore
- **Database**:
  - Nightly `pg_dump` into `/backup/db/YYYY-MM-DD/`
  - Retain 7 daily + 4 weekly
- **Signed PDFs**:
  - Nightly rsync `/data/signed` → NAS or offsite
- **Restore process**:
  - Stop containers
  - Restore DB dump
  - Restore `/data/signed`
  - Start stack
  - Verify by running `/verify` API

---

## 8. Monitoring & Alerts
- Logs:
  - Reverse proxy → `/logs/proxy`
  - Orchestrator → structured JSON logs
  - Rotate logs weekly
- Health checks:
  - `/health` endpoint from orchestrator
  - TLS cert expiry monitoring
- Alerts:
  - Fail2ban on proxy for repeated login attempts
  - Disk usage alerts (>80%)

---

## 9. Security Hardening
- Run containers as **non-root**
- Set `/data/signed` perms to `750`
- Restrict Docuseal **Admin Panel** to separate subdomain `ops-sign.kredit.my` with:
  - IP allowlist (office/VPN)
  - SSO/MFA
- Keep server patched (OS + Docker engine)
- NTP in sync (required for certs + TSA timestamps)

---

## 10. Go-Live Checklist
- [ ] DNS points `sign.kredit.my` → correct public IP
- [ ] Only 80/443 open inbound; 80 redirects to 443
- [ ] HTTPS active, cert renew auto-tested
- [ ] Webhooks from Docuseal → Orchestrator accepted & HMAC verified
- [ ] Orchestrator → SOAP `SignPDF` returns valid PAdES
- [ ] Signed PDFs appear in `/data/signed` and validate in Adobe Reader
- [ ] Backups written to NAS and restore tested
- [ ] Admin panel reachable only from allowlisted IPs
- [ ] Monitoring dashboards green, alerts configured

---
