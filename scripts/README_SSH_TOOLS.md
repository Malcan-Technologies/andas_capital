# SSH Access Management Tools

This directory contains automated tools for managing SSH access to Kredit infrastructure.

## 🎯 Quick Start

### Grant Access to New User
```bash
bash scripts/setup-ssh-access.sh
```

### Revoke Access
```bash
bash scripts/revoke-ssh-access.sh
```

### Run Security Audit
```bash
bash scripts/audit-ssh-access.sh
```

---

## 📚 Available Scripts

### 1. `setup-ssh-access.sh`
**Purpose:** Grant SSH access to new users

**Features:**
- Select which servers to grant access (VPS, On-Prem, or both)
- Interactive prompts for user's public key
- Automatic key deployment to selected servers
- Generates connection instructions for the user
- Automatic backup before changes

**When to use:**
- Onboarding new team members
- Granting contractor access
- Re-establishing access after key rotation

**Usage:**
```bash
cd /Users/ivan/Documents/creditxpress
bash scripts/setup-ssh-access.sh
```

---

### 2. `revoke-ssh-access.sh`
**Purpose:** Remove SSH access from users

**Features:**
- Multiple revocation methods:
  - By line number (view all keys first)
  - By email/comment (fastest for known users)
  - By partial key match (for keys without comments)
- View-only mode to inspect keys
- Restore from backup functionality
- Works on single or both servers
- Automatic backup before changes

**When to use:**
- Team member leaving company
- Contractor project completed
- Key compromise (emergency)
- Regular access reviews

**Usage:**
```bash
cd /Users/ivan/Documents/creditxpress
bash scripts/revoke-ssh-access.sh
```

**Example Workflows:**

**Revoke by email (recommended):**
1. Run script
2. Choose servers (usually option 3 - both)
3. Choose method 2 (by email)
4. Enter user's email
5. Confirm revocation

**Emergency revocation:**
1. Run script
2. Choose option 3 (both servers)
3. Choose option 2 (by email)
4. Enter compromised user's email
5. Confirm immediately

---

### 3. `audit-ssh-access.sh`
**Purpose:** Generate comprehensive security audit reports

**Features:**
- Complete key inventory with fingerprints
- Recent login history analysis
- Failed login attempt tracking
- Current active sessions
- SSH configuration review
- Backup history verification
- Security recommendations
- Timestamped report generation

**When to use:**
- Monthly security reviews (recommended)
- Investigating suspicious activity
- Before/after major access changes
- Compliance documentation

**Usage:**
```bash
cd /Users/ivan/Documents/creditxpress
bash scripts/audit-ssh-access.sh
```

**Output:** Creates `ssh_access_audit_YYYYMMDD_HHMMSS.txt`

**What to check in audit reports:**
- [ ] Total keys match expected team size
- [ ] All keys have email comments
- [ ] No unknown keys present
- [ ] No suspicious failed attempts
- [ ] Recent login IPs are expected (Tailscale)
- [ ] Backups are being maintained

---

## 🏗️ Server Architecture

| Server | IP | User | Purpose |
|--------|-------|------|---------|
| **VPS** | 100.85.61.82 | root | Cloud backend, APIs, databases |
| **On-Prem** | 100.76.8.62 | admin-kapital | DocuSeal, Signing Orchestrator, MTSA |

Both servers accessible via **Tailscale** private network only.

---

## 📋 Common Tasks

### Daily Operations

**View who has access:**
```bash
bash scripts/audit-ssh-access.sh
# Choose option 4 (view only)
```

**Check recent logins:**
```bash
ssh root@100.85.61.82 'last -10'
ssh admin-kapital@100.76.8.62 'last -10'
```

### Monthly Maintenance

**Run security audit:**
```bash
bash scripts/audit-ssh-access.sh
# Archive the report
mkdir -p docs/ssh-audits/
mv ssh_access_audit_*.txt docs/ssh-audits/
```

**Review and remove stale keys:**
```bash
bash scripts/revoke-ssh-access.sh
```

### Quarterly Reviews

1. Generate audit report
2. Cross-reference keys with team roster
3. Remove access for anyone who left
4. Verify all keys have email comments
5. Document findings in `docs/ssh_access_log.txt`

### Annual Key Rotation

1. Notify team 2 weeks in advance
2. Collect new public keys from all users
3. Add new keys while keeping old ones active
4. Verify all users can connect with new keys
5. Revoke all old keys
6. Document completion

---

## 🔒 Security Features

### Automatic Backups
All scripts create automatic backups before making changes:
- Format: `~/.ssh/authorized_keys.backup.YYYYMMDD_HHMMSS`
- Located on each server in `~/.ssh/` directory
- Can be restored using revoke script (option 5)

### Safe Operations
- Interactive confirmations before destructive actions
- Preview of changes before execution
- Ability to skip operations
- Rollback capability via backup restoration

### Audit Trail
- All operations logged in `docs/ssh_access_log.txt`
- Timestamped audit reports
- Login history tracking
- Failed attempt monitoring

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `SSH_ACCESS_SETUP_GUIDE.md` | Complete setup and troubleshooting guide |
| `SSH_QUICK_REFERENCE.md` | One-page cheat sheet |
| `SSH_KEY_MANAGEMENT_WORKFLOWS.md` | Detailed workflows for common scenarios |
| `ssh_access_log.txt` | Access change log |

---

## 🚨 Emergency Procedures

### Compromised Key
```bash
# 1. Immediately revoke
bash scripts/revoke-ssh-access.sh
# Choose option 2 (by email), enter user's email

# 2. Check for unauthorized access
ssh root@100.85.61.82 'last -20 | grep [username]'
ssh root@100.85.61.82 'grep "Failed" /var/log/auth.log | tail -50'

# 3. Generate new key for user
bash scripts/setup-ssh-access.sh

# 4. Document incident
echo "$(date): EMERGENCY - [details]" >> docs/ssh_access_log.txt
```

### Suspicious Activity
```bash
# 1. Run immediate audit
bash scripts/audit-ssh-access.sh

# 2. Check active sessions
ssh root@100.85.61.82 'who'
ssh admin-kapital@100.76.8.62 'who'

# 3. Review failed attempts
ssh root@100.85.61.82 'grep "Failed" /var/log/auth.log | tail -50'

# 4. If unauthorized access detected, revoke immediately
bash scripts/revoke-ssh-access.sh
```

### Accidental Key Removal
```bash
# 1. Run revoke script
bash scripts/revoke-ssh-access.sh

# 2. Choose option 5 (Restore from backup)

# 3. Select the most recent backup before the mistake
```

---

## ✅ Best Practices

### DO:
- ✅ Run monthly audits
- ✅ Revoke access immediately when no longer needed
- ✅ Document all access changes
- ✅ Encourage users to include email in key comments
- ✅ Keep audit reports archived
- ✅ Test user access after granting
- ✅ Use the provided scripts (don't edit manually)

### DON'T:
- ❌ Manually edit authorized_keys without backup
- ❌ Grant access without documenting
- ❌ Leave contractor access active after project
- ❌ Ignore failed login alerts
- ❌ Skip monthly audits
- ❌ Delete backups

---

## 🔧 Troubleshooting

### Script won't connect to server
```bash
# Check Tailscale connection
tailscale status

# Verify you can manually SSH
ssh root@100.85.61.82
ssh admin-kapital@100.76.8.62

# Check your own SSH key is still authorized
```

### Can't find user's key to revoke
```bash
# List all keys with line numbers
ssh root@100.85.61.82 'grep -n "" ~/.ssh/authorized_keys'

# Search for partial match
ssh root@100.85.61.82 'grep -i "search_term" ~/.ssh/authorized_keys'
```

### Need to restore after mistake
```bash
# Run revoke script, choose option 5
bash scripts/revoke-ssh-access.sh

# Or manually restore
ssh root@100.85.61.82 'ls -lht ~/.ssh/authorized_keys.backup.*'
ssh root@100.85.61.82 'cp ~/.ssh/authorized_keys.backup.[timestamp] ~/.ssh/authorized_keys'
```

---

## 📞 Support

1. Check the comprehensive guide: `docs/SSH_ACCESS_SETUP_GUIDE.md`
2. Review workflows: `docs/SSH_KEY_MANAGEMENT_WORKFLOWS.md`
3. Check quick reference: `docs/SSH_QUICK_REFERENCE.md`
4. Review access log for recent changes: `docs/ssh_access_log.txt`

---

## 🔄 Maintenance Schedule

| Frequency | Task | Script |
|-----------|------|--------|
| **As needed** | Grant access | `setup-ssh-access.sh` |
| **As needed** | Revoke access | `revoke-ssh-access.sh` |
| **Monthly** | Security audit | `audit-ssh-access.sh` |
| **Quarterly** | Access review | `revoke-ssh-access.sh` + audit |
| **Annually** | Key rotation | All scripts |

---

**Version:** 1.0  
**Last Updated:** October 2025  
**Maintained By:** System Administrator

