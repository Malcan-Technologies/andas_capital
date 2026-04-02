# Antivirus Compliance Proof – Andas Capital On-Prem Server

**Document Date:** March 19, 2026  
**Server:** kapital-srv (100.67.236.96)  
**Purpose:** Evidence of antivirus deployment for compliance/audit

---

## 1. Antivirus Software

| Field | Value |
|-------|-------|
| **Product** | ClamAV |
| **Version** | 1.4.3 |
| **Vendor** | Cisco (ClamAV open-source project) |
| **Engine Version** | 1.4.3 |
| **Virus Signatures** | 3,627,691 known viruses (as of 2026-03-19) |

---

## 2. Installation Verification

```
ClamAV 1.4.3/27945/Thu Mar 19 06:24:38 2026

----------- SCAN SUMMARY -----------
Known viruses: 3627691
Engine version: 1.4.3
Scanned directories: 20
Scanned files: 1
Infected files: 0
Data scanned: 0.01 MB
Data read: 0.01 MB (ratio 1.50:1)
Time: 16.538 sec
Start Date: 2026:03:19 13:44:37
End Date:   2026:03:19 13:44:54
```

**Result:** No threats detected

---

## 3. Automatic Updates

- **Service:** clamav-freshclam.service  
- **Status:** Active (running)  
- **Description:** Automatic virus definition updates  
- **Databases:**
  - main.cvd (85 MB)
  - daily.cvd (23 MB)
  - bytecode.cvd (276 KB)
  - Last updated: 2026-03-19

---

## 4. Scheduled Scans

| Setting | Value |
|---------|-------|
| **Schedule** | Daily at 3:00 AM MYT (19:00 UTC) |
| **Cron** | `0 19 * * * /usr/local/bin/clamav-daily-scan.sh` |
| **Scan Paths** | /home, /root, /opt, /var/www |
| **Log Location** | /var/log/clamav/daily-scan-YYYYMMDD.log |

---

## 5. Manual Operations

- **Run scan:** `sudo /usr/local/bin/clamav-daily-scan.sh`
- **Check logs:** `ls -lh /var/log/clamav/`
- **Check version:** `clamscan --version`
- **Check update service:** `systemctl status clamav-freshclam`

---

## 6. Compliance Statement

Andas Capital has deployed ClamAV antivirus on the on-premises server (kapital-srv) with:

- ✓ Real-time virus signature updates via freshclam
- ✓ Daily scheduled scans at 3:00 AM MYT
- ✓ Scan logs retained for audit
- ✓ Manual scan capability for on-demand verification

---

*Generated from installation and verification on 2026-03-19*
