# SSH Key Management Workflows

This document describes common workflows for managing SSH access to Kredit infrastructure.

## Quick Reference

| Task | Script | Frequency |
|------|--------|-----------|
| Grant new access | `setup-ssh-access.sh` | As needed |
| Revoke access | `revoke-ssh-access.sh` | As needed |
| Security audit | `audit-ssh-access.sh` | Monthly |

---

## Workflow 1: Onboarding a New Team Member

### Scenario
A new developer joins the team and needs access to both VPS and On-Prem servers.

### Steps

1. **Request public key from new team member**
   ```
   Subject: SSH Access Setup

   Hi [Name],

   To set up your SSH access to our infrastructure, please:

   1. Generate an SSH key if you don't have one:
      ssh-keygen -t ed25519 -C "your-email@company.com"

   2. Send me your PUBLIC key:
      cat ~/.ssh/id_ed25519.pub

   Important: Only send the .pub file content, never your private key!
   ```

2. **Run the setup script**
   ```bash
   cd /Users/ivan/Documents/creditxpress
   bash scripts/setup-ssh-access.sh
   ```

3. **Select access level**
   - Choose option 3 (Both servers) for full-stack developers
   - Choose option 1 (VPS only) for backend developers
   - Choose option 2 (On-Prem only) for infrastructure/signing operations

4. **Paste their public key when prompted**

5. **Send connection instructions**
   The script generates instructions - copy and send them to the new team member

6. **Verify access**
   ```bash
   # After they test, verify they appear in login history
   ssh root@100.85.61.82 'last -5'
   ssh admin-kapital@100.76.8.62 'last -5'
   ```

7. **Document in audit log**
   ```bash
   echo "$(date): Added SSH access for [name] - [email] - [reason]" >> docs/ssh_access_log.txt
   ```

---

## Workflow 2: Offboarding a Team Member

### Scenario
A team member leaves the company or changes roles and no longer needs access.

### Steps

1. **Run the revocation script**
   ```bash
   cd /Users/ivan/Documents/creditxpress
   bash scripts/revoke-ssh-access.sh
   ```

2. **Choose servers**
   - Select which server(s) to revoke from (usually option 3 - both)

3. **Select revocation method**
   - **Option 2 (by email)** - Best choice if they used their email in the key comment
   - **Option 1 (by line number)** - If you need to see all keys first

4. **Confirm revocation**
   Review the keys to be removed and confirm

5. **Verify removal**
   ```bash
   # Check they're no longer in authorized_keys
   ssh root@100.85.61.82 'grep -i "user@email.com" ~/.ssh/authorized_keys'
   # Should return nothing
   ```

6. **Monitor for unauthorized attempts**
   ```bash
   # Check for any attempts to connect with that key
   ssh root@100.85.61.82 'grep "Failed publickey" /var/log/auth.log | tail -20'
   ```

7. **Document in audit log**
   ```bash
   echo "$(date): Revoked SSH access for [name] - [email] - [reason]" >> docs/ssh_access_log.txt
   ```

---

## Workflow 3: Monthly Security Audit

### Scenario
Regular monthly security review of all SSH access.

### Steps

1. **Run the audit script**
   ```bash
   cd /Users/ivan/Documents/creditxpress
   bash scripts/audit-ssh-access.sh
   ```

2. **Review the generated report**
   The script creates a file: `ssh_access_audit_YYYYMMDD_HHMMSS.txt`

3. **Key items to check:**
   - [ ] Total number of keys matches expected team size
   - [ ] All keys have meaningful comments (emails)
   - [ ] No suspicious failed login attempts
   - [ ] No unknown keys present
   - [ ] Backup history is maintained

4. **Cross-reference with team roster**
   ```bash
   # List all key comments
   ssh root@100.85.61.82 'awk "{print \$NF}" ~/.ssh/authorized_keys'
   ```
   Verify each email belongs to a current team member

5. **Remove any stale keys**
   If you find keys that shouldn't be there:
   ```bash
   bash scripts/revoke-ssh-access.sh
   ```

6. **Archive the audit report**
   ```bash
   mkdir -p docs/ssh-audits/
   mv ssh_access_audit_*.txt docs/ssh-audits/
   ```

7. **Document findings**
   ```bash
   echo "$(date): Monthly audit completed - [X] keys on VPS, [Y] keys on On-Prem - [notes]" >> docs/ssh_access_log.txt
   ```

---

## Workflow 4: Key Rotation (Annual)

### Scenario
Annual SSH key rotation policy enforcement.

### Steps

1. **Notify all team members 2 weeks in advance**
   ```
   Subject: Annual SSH Key Rotation - Action Required

   As part of our security best practices, we're rotating all SSH keys.

   By [date], please:
   1. Generate a new SSH key pair
   2. Send the new public key to [admin]
   3. Update your local SSH config

   Your current key will be revoked on [date].
   ```

2. **Create a tracking sheet**
   ```bash
   echo "Name,Email,Old Key Comment,New Key Received,Access Granted,Status" > ssh_rotation_tracking.csv
   ```

3. **As new keys come in, add them**
   ```bash
   bash scripts/setup-ssh-access.sh
   # Keep old keys active initially
   ```

4. **After deadline, verify all users have new keys**
   ```bash
   # Each user should test new key
   bash scripts/audit-ssh-access.sh
   ```

5. **Revoke old keys**
   ```bash
   bash scripts/revoke-ssh-access.sh
   # Remove old keys one by one, verifying correct key
   ```

6. **Verify no service disruption**
   ```bash
   # Check recent logins are successful
   ssh root@100.85.61.82 'last -20'
   ```

7. **Document completion**
   ```bash
   echo "$(date): Annual key rotation completed - All [X] users rotated" >> docs/ssh_access_log.txt
   ```

---

## Workflow 5: Emergency Access Revocation

### Scenario
A team member's laptop is stolen or key is compromised.

### Steps (Time-critical)

1. **Immediately revoke access**
   ```bash
   cd /Users/ivan/Documents/creditxpress
   bash scripts/revoke-ssh-access.sh
   ```

2. **Choose option 2 (search by email)**
   This is fastest for targeted revocation

3. **Verify revocation on both servers**
   ```bash
   ssh root@100.85.61.82 'grep -i "compromised@email.com" ~/.ssh/authorized_keys'
   ssh admin-kapital@100.76.8.62 'grep -i "compromised@email.com" ~/.ssh/authorized_keys'
   # Both should return nothing
   ```

4. **Check recent activity**
   ```bash
   # Look for any suspicious recent logins
   ssh root@100.85.61.82 'last | grep pts | head -20'
   ssh admin-kapital@100.76.8.62 'last | grep pts | head -20'
   ```

5. **Monitor for unauthorized access attempts**
   ```bash
   # Monitor failed attempts with that key
   ssh root@100.85.61.82 'tail -f /var/log/auth.log'
   ```

6. **Generate new key for user**
   Once they have a secure device:
   ```bash
   bash scripts/setup-ssh-access.sh
   ```

7. **Incident documentation**
   ```bash
   echo "$(date): EMERGENCY - Revoked compromised key for [name] - [reason] - [actions taken]" >> docs/ssh_access_log.txt
   ```

8. **Post-incident review**
   - Run full audit
   - Review if any unauthorized access occurred
   - Update security procedures if needed

---

## Workflow 6: Temporary Contractor Access

### Scenario
A contractor needs temporary access for a specific project.

### Steps

1. **Grant access with documentation**
   ```bash
   bash scripts/setup-ssh-access.sh
   ```
   
2. **Set calendar reminder**
   Create reminder for access expiration date

3. **Document temporary access**
   ```bash
   echo "$(date): TEMPORARY access granted to [name] - [email] - Expires: [date] - Project: [name]" >> docs/ssh_access_log.txt
   ```

4. **Limit access scope if possible**
   - Grant only to needed server (VPS or On-Prem, not both)
   - Consider if they can work through screen sharing instead

5. **When project completes, revoke immediately**
   ```bash
   bash scripts/revoke-ssh-access.sh
   ```

6. **Document revocation**
   ```bash
   echo "$(date): Revoked temporary access for [name] - [email] - Project completed" >> docs/ssh_access_log.txt
   ```

---

## Workflow 7: Investigating Suspicious Activity

### Scenario
Alert about unusual SSH activity or failed login attempts.

### Steps

1. **Run immediate audit**
   ```bash
   bash scripts/audit-ssh-access.sh
   ```

2. **Check current active sessions**
   ```bash
   ssh root@100.85.61.82 'who'
   ssh admin-kapital@100.76.8.62 'who'
   ```

3. **Review failed login attempts**
   ```bash
   ssh root@100.85.61.82 'grep "Failed" /var/log/auth.log | tail -50'
   ssh admin-kapital@100.76.8.62 'grep "Failed" /var/log/auth.log | tail -50'
   ```

4. **Check for unknown IP addresses**
   ```bash
   ssh root@100.85.61.82 'last -i | head -30'
   ```
   Cross-reference IPs with known team member IPs (Tailscale)

5. **If unauthorized access detected**
   - Immediately revoke the compromised key
   - Check what commands were run: `history`
   - Review system logs for changes
   - Notify security team

6. **Document investigation**
   ```bash
   echo "$(date): Security investigation - [findings] - [actions taken]" >> docs/ssh_access_log.txt
   ```

---

## Best Practices Summary

### DO:
✅ Always use the provided scripts for consistency
✅ Document all access changes
✅ Verify keys have email comments for identification
✅ Run monthly audits
✅ Revoke access immediately when no longer needed
✅ Keep audit reports archived
✅ Use descriptive comments when adding keys

### DON'T:
❌ Manually edit authorized_keys without backup
❌ Grant access without documenting who and why
❌ Leave contractor access active after project ends
❌ Ignore failed login attempt alerts
❌ Share private keys (users should never do this)
❌ Skip the monthly audit process

---

## Emergency Contacts

If you need help with SSH access management:

1. **Check this documentation first**
2. **Review audit reports** for insights
3. **Check backup files** if you need to rollback:
   ```bash
   ssh root@100.85.61.82 'ls -lht ~/.ssh/authorized_keys.backup.*'
   ```

## Backup and Recovery

All scripts automatically create backups before making changes:

**Backup location:** `~/.ssh/authorized_keys.backup.YYYYMMDD_HHMMSS`

**To restore a backup:**
```bash
bash scripts/revoke-ssh-access.sh
# Choose option 5 (Restore from backup)
```

**To manually restore:**
```bash
ssh root@100.85.61.82 'cp ~/.ssh/authorized_keys.backup.20250122_143000 ~/.ssh/authorized_keys'
```

---

**Last Updated:** October 2025  
**Maintained By:** System Administrator  
**Review Frequency:** Quarterly

