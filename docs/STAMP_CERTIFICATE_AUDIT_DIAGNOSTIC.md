# Stamp Certificate Audit Log Diagnostic

## Issue
Stamp certificates are visible in individual loan pages but not appearing in the Document Audit Logs page.

## Root Cause Analysis

### How It Should Work
1. **File Upload**: Stamp certificates are uploaded via admin panel to `/uploads/stamp-certificates/stamp-cert-{applicationId}-{timestamp}.pdf`
2. **Database Storage**: The relative path `uploads/stamp-certificates/{filename}` is stored in `loan.pkiStampCertificateUrl`
3. **Document Scanner**: Scans the `/uploads/stamp-certificates/` directory recursively
4. **Matching Logic**: Matches files by searching for `file.fileName` in `loan.pkiStampCertificateUrl` field
5. **Audit Log Creation**: Creates `DocumentAuditLog` entries with user/loan linkage

### Potential Issues

#### 1. **Files Not Present on Production Server**
The most likely cause is that the stamp certificate files exist in the database but not physically on the VPS filesystem.

**How to Check (SSH into VPS):**
```bash
# Check if directory exists
ssh root@164.92.75.191 "cd /root/creditxpress/backend && docker compose -f docker-compose.prod.yml exec backend ls -la uploads/stamp-certificates/"

# Count files in directory
ssh root@164.92.75.191 "cd /root/creditxpress/backend && docker compose -f docker-compose.prod.yml exec backend find uploads/stamp-certificates -type f | wc -l"

# List all stamp certificate files
ssh root@164.92.75.191 "cd /root/creditxpress/backend && docker compose -f docker-compose.prod.yml exec backend find uploads/stamp-certificates -type f -name '*.pdf'"
```

**Expected Output:**
Should show 11 PDF files matching the pattern `stamp-cert-{id}-{timestamp}.pdf`

#### 2. **Database References vs Physical Files Mismatch**
The database might have references to files that were never uploaded or were deleted.

**How to Check:**
```sql
-- Query all stamp certificate URLs in database
SELECT id, applicationId, pkiStampCertificateUrl 
FROM loans 
WHERE pkiStampCertificateUrl IS NOT NULL;
```

#### 3. **File Path Mismatch**
Check if the database stores the path differently than expected.

**Example from your local files:**
- Filename: `stamp-cert-cmgxl7lg1000zd32977s4pww9-1760871308167.pdf`
- Expected DB path: `uploads/stamp-certificates/stamp-cert-cmgxl7lg1000zd32977s4pww9-1760871308167.pdf`

#### 4. **Scanner Not Detecting Files**
The document scanner might not be reaching the stamp-certificates directory.

**How Scanner Works:**
```typescript
// Line 469-476 in documentScanner.ts
const uploadsDir = path.join(process.cwd(), 'uploads');
vpsFiles = await scanDirectory(uploadsDir, uploadsDir);
// This recursively scans ALL subdirectories including stamp-certificates/
```

**Type Detection Logic:**
```typescript
// Line 57-58
} else if (relativePath.includes('stamp-certificates')) {
    documentType = 'STAMP_CERTIFICATE';
```

**Matching Logic:**
```typescript
// Line 165-186
const loan = await prisma.loan.findFirst({
    where: {
        OR: [
            { pkiSignedPdfUrl: { contains: file.fileName } },
            { pkiStampedPdfUrl: { contains: file.fileName } },
            { pkiStampCertificateUrl: { contains: file.fileName } }, // <-- This matches stamp certificates
        ],
    },
    // ...
});
```

## Diagnostic Steps

### Step 1: Check Production Files
```bash
# SSH into VPS
ssh root@164.92.75.191

# Navigate to backend
cd /root/creditxpress/backend

# Check if stamp-certificates directory exists
docker compose -f docker-compose.prod.yml exec backend ls -la uploads/ | grep stamp

# List all stamp certificate files
docker compose -f docker-compose.prod.yml exec backend ls -la uploads/stamp-certificates/

# Count files
docker compose -f docker-compose.prod.yml exec backend find uploads/stamp-certificates -type f | wc -l
```

### Step 2: Compare with Database
```bash
# Connect to production database
docker compose -f docker-compose.prod.yml exec backend npx prisma studio

# Or via psql:
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d creditxpress -c "SELECT id, applicationId, pkiStampCertificateUrl FROM loans WHERE pkiStampCertificateUrl IS NOT NULL;"
```

### Step 3: Trigger Manual Scan (via Admin Panel)
1. Login to admin panel: https://admin.kredit.my
2. Navigate to: Audit Logs → Document Storage Logs
3. Click "Scan Documents" button
4. Check the scan stats:
   - **Total Scanned**: Should include stamp certificates
   - **VPS Files**: Should include files from stamp-certificates directory
   - **Matched vs Orphaned**: Check if stamp certificates are being matched

### Step 4: Check Scanner Logs
```bash
# View backend logs during scan
docker compose -f docker-compose.prod.yml logs backend --tail=100 --follow
```

**Expected Log Output:**
```
Scanning VPS uploads directory: /app/uploads
Found {N} files in VPS uploads
```

Look for:
- Files from `stamp-certificates/` directory being scanned
- Matching success/failure for stamp certificate files
- Any errors during scan

## Solutions

### Solution 1: If Files Are Missing on Production
**Cause**: Files were uploaded but saved to wrong location or never uploaded to production.

**Fix**: Re-upload stamp certificates via admin panel for each loan that needs them.

### Solution 2: If Files Exist But Not Detected
**Cause**: Directory permissions or path issues.

**Fix**:
```bash
# Ensure directory has correct permissions
docker compose -f docker-compose.prod.yml exec backend chmod -R 777 uploads/stamp-certificates/

# Rebuild container to ensure latest scanner code
cd /root/creditxpress/backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### Solution 3: If Database Path Format Is Wrong
**Cause**: Old uploads might have different path format.

**Fix**: Would need to update document scanner to handle legacy path formats (similar to disbursement slip fix).

## Verification

After applying fixes:

1. ✅ Trigger manual scan in admin panel
2. ✅ Check scan stats show correct VPS file count
3. ✅ Verify stamp certificates appear in Document Audit Logs
4. ✅ Verify stamp certificates are linked to correct loans/users
5. ✅ Filter by "STAMP_CERTIFICATE" document type shows results
6. ✅ Loan IDs are clickable and link to correct loans

## Code References

- **Scanner**: `backend/src/lib/documentScanner.ts`
  - Line 57-58: Type detection
  - Line 165-186: Loan matching logic
  - Line 469-476: Upload directory scanning

- **Upload Endpoint**: `backend/src/api/admin.ts`
  - Line 11909: Filename pattern
  - Line 12546: Database storage path

- **Deployment**: `.github/workflows/deploy.yaml`
  - Line 612-613: Directory creation with permissions

## Next Steps

1. **Immediate**: Run diagnostic Step 1 to check if files exist on production
2. **If files missing**: Identify why files weren't uploaded to production
3. **If files exist**: Check scanner logs to see why they're not being detected
4. **Re-scan**: Trigger manual scan after fixes
5. **Verify**: Confirm stamp certificates appear in audit logs

---

**Note**: The document scanner code is correct and should work. The issue is most likely:
- Files physically missing from production server
- Or files in a different location than expected

