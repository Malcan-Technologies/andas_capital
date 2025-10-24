# Infrastructure Access & Security Management

> **Quick Start (SSH):** `cd /Users/ivan/Documents/creditxpress && bash scripts/setup-ssh-access.sh`  
> **Quick Start (SSL):** `cd /Users/ivan/Documents/creditxpress && bash scripts/audit-ssl-certs.sh`

---

## 📂 File Structure

```
creditxpress/
├── scripts/
│   ├── setup-ssh-access.sh          ← Grant SSH access
│   ├── revoke-ssh-access.sh         ← Revoke SSH access
│   ├── audit-ssh-access.sh          ← Generate SSH audit reports
│   ├── audit-ssl-certs.sh           ← Audit SSL certificates
│   └── README_SSH_TOOLS.md          ← Script documentation
│
├── docs/
│   ├── SSH_ACCESS_SETUP_GUIDE.md    ← Complete SSH guide
│   ├── SSH_QUICK_REFERENCE.md       ← SSH one-page cheat sheet
│   ├── SSH_KEY_MANAGEMENT_WORKFLOWS.md  ← 7 detailed SSH workflows
│   ├── SSH_TOOLS_SUMMARY.md         ← SSH system overview
│   ├── SSL_CERT_AUDIT_GUIDE.md      ← SSL certificate audit guide
│   ├── ssh_access_log.txt           ← Access change log
│   ├── ssh-audits/                  ← Archive SSH audit reports
│   └── ssl-audits/                  ← Archive SSL audit reports
│
└── SSH_MANAGEMENT_INDEX.md          ← This file
```

---

## 🎯 What Do You Want to Do?

### SSH Access Management

#### Grant Access to Someone New
```bash
bash scripts/setup-ssh-access.sh
```
📖 **Guide:** [SSH_ACCESS_SETUP_GUIDE.md](docs/SSH_ACCESS_SETUP_GUIDE.md#option-1-using-the-automated-script-recommended)

---

### Remove Someone's Access
```bash
bash scripts/revoke-ssh-access.sh
```
📖 **Guide:** [SSH_ACCESS_SETUP_GUIDE.md](docs/SSH_ACCESS_SETUP_GUIDE.md#revoking-access-recommended-method)

---

### Run Security Audit
```bash
bash scripts/audit-ssh-access.sh
```
📖 **Guide:** [SSH_ACCESS_SETUP_GUIDE.md](docs/SSH_ACCESS_SETUP_GUIDE.md#audit-ssh-access)

---

### View Current Access
```bash
# VPS
ssh root@100.85.61.82 'cat ~/.ssh/authorized_keys'

# On-Prem
ssh admin-kapital@100.76.8.62 'cat ~/.ssh/authorized_keys'
```
📖 **Guide:** [SSH_QUICK_REFERENCE.md](docs/SSH_QUICK_REFERENCE.md#view-authorized-keys)

---

### Check Who's Logged In
```bash
ssh root@100.85.61.82 'last -20'
ssh admin-kapital@100.76.8.62 'last -20'
```

---

### Restore Accidentally Removed Key
```bash
bash scripts/revoke-ssh-access.sh
# Choose option 5 (Restore from backup)
```
📖 **Guide:** [SSH_KEY_MANAGEMENT_WORKFLOWS.md](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md#workflow-5-emergency-access-revocation)

---

### SSL Certificate Management

#### Audit All SSL Certificates
```bash
bash scripts/audit-ssl-certs.sh
```
📖 **Guide:** [SSL_CERT_AUDIT_GUIDE.md](docs/SSL_CERT_AUDIT_GUIDE.md)

---

#### Check Domain Certificate Expiry
```bash
bash scripts/audit-ssl-certs.sh
# Choose option 1 (Check all public domains)
```
📖 **Guide:** [SSL_CERT_AUDIT_GUIDE.md](docs/SSL_CERT_AUDIT_GUIDE.md#option-1-check-all-public-domains)

---

#### Download Certificate for Audit
```bash
bash scripts/audit-ssl-certs.sh
# Choose option 4 (Download specific certificate)
```
📖 **Guide:** [SSL_CERT_AUDIT_GUIDE.md](docs/SSL_CERT_AUDIT_GUIDE.md#option-4-download-specific-certificate)

---

#### Check Server Certificates
```bash
# VPS
bash scripts/audit-ssl-certs.sh  # Option 2

# On-Prem
bash scripts/audit-ssl-certs.sh  # Option 3
```
📖 **Guide:** [SSL_CERT_AUDIT_GUIDE.md](docs/SSL_CERT_AUDIT_GUIDE.md)

---

## 📚 Documentation Guide

### For You (Administrator)

#### SSH Access Management
| Document | When to Read | Use Case |
|----------|--------------|----------|
| [SSH_TOOLS_SUMMARY.md](docs/SSH_TOOLS_SUMMARY.md) | **Start here** | Overview of SSH system |
| [SSH_QUICK_REFERENCE.md](docs/SSH_QUICK_REFERENCE.md) | Daily use | Quick SSH commands |
| [SSH_KEY_MANAGEMENT_WORKFLOWS.md](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md) | As needed | Step-by-step workflows |
| [README_SSH_TOOLS.md](scripts/README_SSH_TOOLS.md) | Reference | Detailed script docs |

#### SSL Certificate Management
| Document | When to Read | Use Case |
|----------|--------------|----------|
| [SSL_CERT_AUDIT_GUIDE.md](docs/SSL_CERT_AUDIT_GUIDE.md) | **Start here** | SSL certificate auditing |

### For New Users

| Document | Purpose |
|----------|---------|
| [SSH_ACCESS_SETUP_GUIDE.md](docs/SSH_ACCESS_SETUP_GUIDE.md) | Complete setup and troubleshooting guide |
| [SSH_QUICK_REFERENCE.md](docs/SSH_QUICK_REFERENCE.md) | Quick connection commands |

---

## 🔧 Common Workflows

### 1️⃣ Onboarding New Team Member
👉 **Workflow:** [SSH_KEY_MANAGEMENT_WORKFLOWS.md - Workflow 1](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md#workflow-1-onboarding-a-new-team-member)

**TL;DR:**
1. Get their public key
2. `bash scripts/setup-ssh-access.sh`
3. Choose servers (VPS/On-Prem/Both)
4. Paste public key
5. Send instructions to user
6. Log in `docs/ssh_access_log.txt`

---

### 2️⃣ Offboarding Team Member
👉 **Workflow:** [SSH_KEY_MANAGEMENT_WORKFLOWS.md - Workflow 2](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md#workflow-2-offboarding-a-team-member)

**TL;DR:**
1. `bash scripts/revoke-ssh-access.sh`
2. Choose both servers
3. Search by email
4. Confirm revocation
5. Verify removal
6. Log in `docs/ssh_access_log.txt`

---

### 3️⃣ Monthly Security Audit
👉 **Workflow:** [SSH_KEY_MANAGEMENT_WORKFLOWS.md - Workflow 3](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md#workflow-3-monthly-security-audit)

**TL;DR:**
1. `bash scripts/audit-ssh-access.sh`
2. Review generated report
3. Check for unknown keys
4. Archive report: `mv ssh_access_audit_*.txt docs/ssh-audits/`
5. Log findings

---

### 4️⃣ Emergency Key Revocation
👉 **Workflow:** [SSH_KEY_MANAGEMENT_WORKFLOWS.md - Workflow 5](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md#workflow-5-emergency-access-revocation)

**TL;DR:**
1. `bash scripts/revoke-ssh-access.sh` (IMMEDIATELY)
2. Choose both servers, search by email
3. Check for unauthorized access
4. Monitor logs
5. Document incident

---

## 🖥️ Server Information

### VPS (Cloud Server)
- **IP:** `100.85.61.82` (Tailscale)
- **User:** `root`
- **Purpose:** Backend, APIs, Databases
- **Connect:** `ssh root@100.85.61.82`

### On-Premise Server
- **IP:** `100.76.8.62` (Tailscale)
- **User:** `admin-kapital`
- **Purpose:** DocuSeal, Signing Orchestrator, MTSA
- **Connect:** `ssh admin-kapital@100.76.8.62`

---

## 🔒 Security Features

✅ **Automatic Backups** - Every change creates backup  
✅ **Interactive Confirmations** - Prevents accidents  
✅ **Multiple Revocation Methods** - By email, line number, or key match  
✅ **Comprehensive Audits** - Keys, logins, failed attempts  
✅ **Restore Capability** - Rollback from backups  
✅ **Audit Trails** - Timestamped reports and logs  

---

## 📅 Maintenance Schedule

| Frequency | Task | Command |
|-----------|------|---------|
| **As needed** | Grant access | `bash scripts/setup-ssh-access.sh` |
| **As needed** | Revoke access | `bash scripts/revoke-ssh-access.sh` |
| **Monthly** | Security audit | `bash scripts/audit-ssh-access.sh` |
| **Quarterly** | Access review | Audit + remove stale keys |
| **Annually** | Key rotation | All team members rotate keys |

---

## 🆘 Emergency Quick Reference

| Emergency | Command | Details |
|-----------|---------|---------|
| **Compromised key** | `bash scripts/revoke-ssh-access.sh` | Option 3 (both), Method 2 (email) |
| **Accidental removal** | `bash scripts/revoke-ssh-access.sh` | Option 5 (restore backup) |
| **Suspicious activity** | `bash scripts/audit-ssh-access.sh` | Check immediately |
| **Can't connect** | `tailscale status` | Verify Tailscale first |

---

## 📖 Where to Get Help

1. **Quick commands?** → [SSH_QUICK_REFERENCE.md](docs/SSH_QUICK_REFERENCE.md)
2. **How to do X?** → [SSH_KEY_MANAGEMENT_WORKFLOWS.md](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md)
3. **Complete guide?** → [SSH_ACCESS_SETUP_GUIDE.md](docs/SSH_ACCESS_SETUP_GUIDE.md)
4. **Script details?** → [scripts/README_SSH_TOOLS.md](scripts/README_SSH_TOOLS.md)
5. **System overview?** → [SSH_TOOLS_SUMMARY.md](docs/SSH_TOOLS_SUMMARY.md)

---

## ✅ System Status

- **Status:** ✅ Production Ready
- **Scripts:** 3 (all executable)
- **Documentation:** 6 files
- **Servers:** 2 (VPS + On-Prem)
- **Version:** 1.0
- **Created:** October 2025

---

## 🎓 Key Concepts

### Public vs Private Keys
- **Public key** (.pub) - Safe to share, goes on servers
- **Private key** - NEVER share, stays on user's machine

### Key Comments
- Always include email in SSH key for identification
- Example: `ssh-keygen -t ed25519 -C "user@company.com"`
- Makes auditing and revocation easier

### Backups
- Automatic: Scripts create backups before changes
- Format: `authorized_keys.backup.YYYYMMDD_HHMMSS`
- Location: `~/.ssh/` on each server
- Restore: Use revoke script option 5

### Audit Reports
- Generated by: `audit-ssh-access.sh`
- Format: `ssh_access_audit_YYYYMMDD_HHMMSS.txt`
- Contains: Keys, logins, failures, sessions, recommendations
- Archive in: `docs/ssh-audits/`

---

## 🚀 Next Steps

### First Time Setup
1. ✅ Review [SSH_TOOLS_SUMMARY.md](docs/SSH_TOOLS_SUMMARY.md)
2. ✅ Test a script: `bash scripts/audit-ssh-access.sh`
3. ✅ Add monthly reminder for audits
4. ✅ Share [SSH_ACCESS_SETUP_GUIDE.md](docs/SSH_ACCESS_SETUP_GUIDE.md) with team

### This Week
- [ ] Run first audit
- [ ] Review current authorized keys
- [ ] Document current access in log
- [ ] Remove any unknown keys

### This Month
- [ ] Establish audit schedule
- [ ] Brief team on SSH practices
- [ ] Set up quarterly review

---

## 📞 Support

Having issues? Check documentation in this order:

1. This index file (you are here)
2. [SSH_QUICK_REFERENCE.md](docs/SSH_QUICK_REFERENCE.md) - Quick commands
3. [SSH_ACCESS_SETUP_GUIDE.md](docs/SSH_ACCESS_SETUP_GUIDE.md) - Detailed troubleshooting
4. [SSH_KEY_MANAGEMENT_WORKFLOWS.md](docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md) - Step-by-step guides

---

**Last Updated:** October 22, 2025  
**System Version:** 1.0  
**Maintained By:** System Administrator

---

## Quick Command Reference

```bash
# Location
cd /Users/ivan/Documents/creditxpress

# === SSH ACCESS MANAGEMENT ===

# Grant access
bash scripts/setup-ssh-access.sh

# Revoke access
bash scripts/revoke-ssh-access.sh

# Run SSH audit
bash scripts/audit-ssh-access.sh

# View current keys
ssh root@100.85.61.82 'cat ~/.ssh/authorized_keys'
ssh admin-kapital@100.76.8.62 'cat ~/.ssh/authorized_keys'

# Check recent logins
ssh root@100.85.61.82 'last -20'
ssh admin-kapital@100.76.8.62 'last -20'

# === SSL CERTIFICATE MANAGEMENT ===

# Audit SSL certificates
bash scripts/audit-ssl-certs.sh

# Check specific domain
echo | openssl s_client -servername kredit.my -connect kredit.my:443 2>/dev/null | openssl x509 -noout -dates

# Renew Let's Encrypt certs
ssh root@100.85.61.82 'sudo certbot renew && sudo systemctl reload nginx'

# List Let's Encrypt certificates
ssh root@100.85.61.82 'sudo certbot certificates'
```

---

**🎉 You're all set!**  
**SSH Access:** `bash scripts/setup-ssh-access.sh`  
**SSL Audit:** `bash scripts/audit-ssl-certs.sh`

