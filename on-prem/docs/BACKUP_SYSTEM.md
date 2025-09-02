# 🛡️ Comprehensive Backup & Restore System

## ⚠️ **CRITICAL LESSON LEARNED**

**NEVER use `docker-compose down -v` or `docker volume prune -f`** - these commands permanently delete ALL persistent data including:
- User accounts and passwords
- Document templates and configurations  
- Uploaded documents and signed files
- Database records and settings

## 🚀 **Backup System Features**

### **What Gets Backed Up:**
1. **📁 Application Files** - Docker compose files, configurations, scripts
2. **🗄️ Database** - Complete PostgreSQL dump with all user data, documents, settings
3. **💾 Docker Volumes** - All persistent storage including uploads, documents, storage
4. **📋 Manifest** - Detailed backup contents and restore instructions

### **Automatic Features:**
- ✅ Runs before every deployment
- ✅ Keeps last 10 backups (auto-cleanup)
- ✅ Comprehensive restore instructions
- ✅ Timestamped backups
- ✅ Detailed logging

## 📋 **Commands**

### **Create Backup:**
```bash
# Create comprehensive backup
./deploy-all.sh backup

# Create safety backup with reason
./create-safety-backup.sh "Before major changes"
```

### **List Available Backups:**
```bash
# List backups
./deploy-all.sh restore
```

### **Restore from Backup:**
```bash
# Restore specific backup
./deploy-all.sh restore full-backup-20250830_112130

# This will:
# 1. Stop all services
# 2. Restore application files
# 3. Restore database
# 4. Restore Docker volumes
# 5. Restart all services
```

## 🔧 **Manual Backup Operations**

### **Database Only:**
```bash
ssh opg-srv "cd docuseal-onprem && docker exec docuseal-postgres pg_dump -U docuseal -d docuseal > backup-$(date +%Y%m%d).sql"
```

### **Volumes Only:**
```bash
ssh opg-srv "docker run --rm -v docuseal-onprem_docuseal_storage:/source -v $(pwd):/backup alpine tar czf /backup/storage-backup.tar.gz -C /source ."
```

## 📂 **Backup Structure**

```
/home/admin-kapital/backups/
├── full-backup-YYYYMMDD_HHMMSS-files.tar.gz       # Application files
├── full-backup-YYYYMMDD_HHMMSS-docuseal-db.sql    # Database dump
├── full-backup-YYYYMMDD_HHMMSS-manifest.txt       # Backup details & instructions
└── volumes/
    ├── full-backup-YYYYMMDD_HHMMSS-docuseal-onprem_docuseal_storage.tar.gz
    ├── full-backup-YYYYMMDD_HHMMSS-docuseal-onprem_docuseal_uploads.tar.gz
    └── full-backup-YYYYMMDD_HHMMSS-docuseal-onprem_postgres_data.tar.gz
```

## 🚨 **Emergency Recovery**

### **If Data is Lost:**
1. **Don't Panic** - Your data is backed up!
2. **List backups**: `./deploy-all.sh restore`
3. **Choose backup**: `./deploy-all.sh restore <backup-name>`
4. **Verify restoration**: `./deploy-all.sh status`

### **If Backup System Fails:**
```bash
# Manual database restore
ssh opg-srv "cd docuseal-onprem && docker exec -i docuseal-postgres psql -U docuseal -d docuseal < /path/to/backup.sql"

# Manual volume restore
ssh opg-srv "docker run --rm -v VOLUME_NAME:/target -v /path/to/backups:/backup alpine tar xzf /backup/volume-backup.tar.gz -C /target"
```

## 🛡️ **Best Practices**

### **Before ANY Changes:**
```bash
# Always create a safety backup first!
./create-safety-backup.sh "Before troubleshooting XYZ"
```

### **Regular Maintenance:**
- Backups are created automatically on every deployment
- Old backups are cleaned up automatically (keeps last 10)
- Check backup status regularly: `./deploy-all.sh backup`

### **Critical Rules:**
1. ✅ **ALWAYS backup before troubleshooting**
2. ✅ **Use `docker-compose down` (without -v)**
3. ✅ **Never use `docker volume prune -f`**
4. ✅ **Test restore process periodically**
5. ✅ **Keep backups in multiple locations for production**

## 📊 **Monitoring Backups**

### **Check Backup Health:**
```bash
# View recent backups
ssh opg-srv "cd /home/admin-kapital && ls -la backups/full-backup-*-manifest.txt | head -5"

# Check backup sizes
ssh opg-srv "cd /home/admin-kapital && du -sh backups/*"

# View backup manifest
ssh opg-srv "cd /home/admin-kapital && cat backups/full-backup-YYYYMMDD_HHMMSS-manifest.txt"
```

## 🎯 **Recovery Testing**

Periodically test the restore process:
1. Create a test backup
2. Make a small change (add a test document)
3. Restore from backup
4. Verify the test change is gone
5. Confirm system works normally

---

**Remember: This backup system was created after accidentally deleting all DocuSeal data. It ensures this NEVER happens again! 🛡️**
