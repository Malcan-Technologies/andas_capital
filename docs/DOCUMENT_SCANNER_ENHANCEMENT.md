# Document Scanner Enhancement - November 6, 2025

## Summary

Fixed two critical issues with the document audit logging system:
1. On-prem documents were not being picked up during scans
2. Documents were being incorrectly classified as UNKNOWN type

## Issue 1: On-prem Documents Not Being Picked Up

### Root Cause
The `/api/agreements` endpoint was missing from the deployed signing orchestrator container. The endpoint existed in the source code (line 1796 in `api.ts`) but the container was built on September 19, 2024, before this endpoint was added.

### Solution
1. **Backed up database**: Created backup of `agreements_db` PostgreSQL database before any changes
2. **Rebuilt container**: Stopped, rebuilt, and redeployed the signing orchestrator with the latest code containing the `/api/agreements` endpoint
3. **Verified functionality**: Confirmed endpoint returns 19 agreements from the on-prem database

### Results
- **Before**: 0 on-prem files detected
- **After**: 38 on-prem documents successfully indexed
- The orchestrator is now running with the updated code and all data volumes were preserved

### Commands Used
```bash
# On-prem server (100.76.8.62)
cd /home/admin-kapital/signing-orchestrator
docker-compose down
docker-compose build
docker-compose up -d

# Verify endpoint works
curl -H 'X-API-Key: YCT57XLoQtBF6GcaaiTsL93BiH9v1faapBqDH4nrK88' \
  'http://localhost:4010/api/agreements?limit=2'
```

## Issue 2: Documents Classified as UNKNOWN

### Root Cause
The document scanner only classified files based on their directory path:
- Files in `kyc/` → KYC
- Files in `disbursement-slips/` → DISBURSEMENT_SLIP
- Files in `stamped-agreements/` → STAMPED_AGREEMENT
- Files in `stamp-certificates/` → STAMP_CERTIFICATE
- Files in `default-letters/` → DEFAULT_LETTER
- Files in `receipts/` or starting with `RCP-` → PAYMENT_RECEIPT
- **All other files** → UNKNOWN

Many documents were stored directly in `/app/uploads/` root directory (e.g., `1762151384170.pdf`, `1761800786766.pdf`) and couldn't be classified by path alone.

### Solution
Enhanced `matchFileToDatabase()` function to infer document types from database matches:

1. **UserDocument matches** → Inferred as KYC documents
2. **LoanDisbursement matches** → Inferred as DISBURSEMENT_SLIP
3. **Loan PKI fields**:
   - `pkiSignedPdfUrl` → SIGNED_AGREEMENT
   - `pkiStampedPdfUrl` → STAMPED_AGREEMENT
   - `pkiStampCertificateUrl` → STAMP_CERTIFICATE
4. **PaymentReceipt matches** → Inferred as PAYMENT_RECEIPT

The scanner now:
1. First attempts to classify by directory structure (existing behavior)
2. If classification is UNKNOWN, matches the file against database records
3. Uses the inferred type from successful database matches
4. Only marks as UNKNOWN if no database match is found

### Code Changes
Modified `backend/src/lib/documentScanner.ts`:
- Added `inferredDocumentType` return field to `matchFileToDatabase()` function
- Updated all database match branches to return appropriate document types
- Modified the main scanning loop to use inferred types when original type is UNKNOWN

### Results
Documents that were previously UNKNOWN are now correctly classified based on their database relationships, providing accurate document type tracking without requiring file reorganization.

## Final Scan Statistics

### Latest Scan Results (After Fixes)
```
Total Scanned: 98 documents
- VPS Files: 60
- On-Prem Files: 38 (previously 0)
- Matched: 76 documents
- Orphaned: 22 documents
- Errors: 0
```

### Document Type Distribution
The enhanced scanner now correctly identifies:
- KYC documents (from UserDocument table)
- Disbursement slips (from LoanDisbursement table)
- Signed agreements (from Loan.pkiSignedPdfUrl)
- Stamped agreements (from Loan.pkiStampedPdfUrl)
- Stamp certificates (from Loan.pkiStampCertificateUrl)
- Payment receipts (from PaymentReceipt table)

## Technical Details

### On-Prem Integration
The backend now successfully connects to the signing orchestrator via:
- URL: `https://sign.creditxpress.com.my`
- Endpoint: `GET /api/agreements?limit=1000`
- Authentication: `X-API-Key` header
- Returns: Agreement metadata including file paths, names, sizes, and loan/user associations

### Database Schema
Document audit logs stored in `DocumentAuditLog` table with fields:
- `filePath`, `fileName`, `fileSize`, `fileType`
- `documentType` (now accurately inferred)
- `userId`, `userName`, `loanId`, `applicationId`
- `uploadedAt`, `isOrphaned`, `source`
- `metadata` (JSON field for additional context)

## Deployment Notes

### On-Prem Server
- Location: 100.76.8.62 (admin-kapital@)
- Directory: `/home/admin-kapital/signing-orchestrator`
- Docker volumes preserved during rebuild:
  - `signing-orchestrator_agreements-postgres-data`
  - `signing-orchestrator_signed-pdfs`
  - `signing-orchestrator_stamped-pdfs`
  - `signing-orchestrator_original-pdfs`

### VPS Server  
- Location: 100.85.61.82 (root@)
- Backend rebuilt with enhanced scanner
- Environment variables verified:
  - `SIGNING_ORCHESTRATOR_URL=https://sign.creditxpress.com.my`
  - `SIGNING_ORCHESTRATOR_API_KEY` configured correctly

## Future Improvements

1. **Orphaned Document Investigation**: 22 orphaned documents should be reviewed to determine if they're:
   - Legacy files that can be archived
   - Missing database records that need creation
   - Test files that can be removed

2. **Directory Structure**: Consider organizing future uploads into subdirectories to improve initial classification and reduce database lookups

3. **Monitoring**: Add alerts for when scan errors exceed threshold or orphaned document count increases significantly

## Testing Verification

To verify the fixes are working:

```bash
# 1. Check on-prem endpoint (from VPS)
curl -H 'X-API-Key: YOUR_API_KEY' \
  'https://sign.creditxpress.com.my/api/agreements?limit=5'

# 2. Trigger document scan via admin panel
# Navigate to: Admin > Audit Logs > Documents > Click "Scan Documents"

# 3. Verify results show:
# - onpremFiles > 0
# - Reduced UNKNOWN document types
# - No errors in scan stats
```

## Related Files

- `backend/src/lib/documentScanner.ts` - Main scanner logic
- `on-prem/signing-orchestrator/src/routes/api.ts` - Orchestrator API routes
- `admin/app/dashboard/audit-logs/documents/page.tsx` - Admin UI for document logs
- `backend/src/api/admin/document-logs.ts` - Backend API for document logging

## References

- Signing Orchestrator API Key: Stored in environment variables on both servers
- Database backups: `/tmp/agreements_backup_*.sql` on on-prem server
- Prisma schema: `backend/prisma/schema.prisma` (DocumentAuditLog model)

