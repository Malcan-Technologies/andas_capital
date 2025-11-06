# Signed Agreement Download Issue - Root Cause Analysis

**Date:** November 6, 2025  
**Status:** IDENTIFIED - NO CHANGES CAUSED THIS  
**Environment:** Production VPS + On-Prem Signing Orchestrator

## Issue Summary

Users are unable to download signed agreements and stamp certificates from the loans page. The downloads fail with HTTP 500 errors in the frontend and 404 errors from the signing orchestrator.

## Error Messages

**Frontend:**
```
[Error] Failed to load resource: the server responded with a status of 500 ()
[Error] Error downloading signed agreement: – Error: Failed to download signed agreement from signing orchestrator
```

**Backend Logs:**
```
Admin downloading PKI PDF from: https://sign.creditxpress.com.my/api/signed/cmg7h4do100aetytacum1wg6t/download
Failed to download PKI-signed PDF: Error: Signing orchestrator responded with status: 404

User downloading PKI PDF from: https://sign.creditxpress.com.my/api/signed/cmgxn4vn2000nwinp1t58fa4s/download
Failed to download PKI-signed PDF: Error: Signing orchestrator responded with status: 404
```

**Signing Orchestrator:**
```json
{
  "error": "Not Found",
  "message": "Signed PDF not found for this application"
}
```

## Root Cause

### The Problem: Missing Data on On-Prem Server

The signed agreements **do not exist** in the on-prem signing orchestrator's database for these specific loans:

1. **Backend Storage (VPS):**
   - Application ID: `cmg7h4do100aetytacum1wg6t`
   - Loan ID: `cmg7h54ag00attyta3uy2uxfd`
   - pkiSignedPdfUrl: `https://sign.creditxpress.com.my/api/signed/cmg7h4do100aetytacum1wg6t/download`

2. **Orchestrator Database (On-Prem):**
   - Query: `SELECT * FROM signed_agreements WHERE "loanId" = 'cmg7h54ag00attyta3uy2uxfd'`
   - Result: **0 rows** (file doesn't exist)

### Why This Happens

The signing orchestrator endpoint expects to find records in its `signed_agreements` table:

```typescript
// on-prem/signing-orchestrator/src/routes/api.ts:1719
router.get('/signed/:applicationId/download', verifyApiKey, async (req, res) => {
  const { applicationId } = req.params;
  
  // Query database to find the signed agreement
  const signedAgreement = await prisma.signedAgreement.findFirst({
    where: { loanId: applicationId }  // ❌ Searching by loanId but receives applicationId
  });
  
  if (!signedAgreement || !signedAgreement.signedFilePath) {
    res.status(404).json({
      error: 'Not Found',
      message: 'Signed PDF not found for this application',
    });
    return;
  }
  // ...
});
```

### Additional Confusion: Parameter Naming Mismatch

The endpoint is called `/signed/:applicationId/download` but the code searches for `loanId`. In reality:
- **Backend sends:** `applicationId` (e.g., `cmg7h4do100aetytacum1wg6t`)
- **Orchestrator searches by:** `loanId` field in database
- **Actual loanId is different:** `cmg7h54ag00attyta3uy2uxfd`

However, this naming is actually correct because:
- The orchestrator stores `loanId` as the **applicationId from the main backend**
- So `signed_agreements.loanId` should match `loan_applications.id`
- Not `loans.id`

## Investigation Results

### VPS Backend Database

```sql
SELECT id as loan_id, "applicationId", "pkiSignedPdfUrl", "pkiStampCertificateUrl" 
FROM loans 
WHERE "applicationId" IN ('cmg7h4do100aetytacum1wg6t', 'cmgxn4vn2000nwinp1t58fa4s');
```

| loan_id | applicationId | pkiSignedPdfUrl | pkiStampCertificateUrl |
|---------|---------------|-----------------|------------------------|
| cmg7h54ag00attyta3uy2uxfd | cmg7h4do100aetytacum1wg6t | https://sign.creditxpress.com.my/api/signed/cmg7h4do100aetytacum1wg6t/download | NULL |
| cmgxn5ohy001kwinph7tsi9ye | cmgxn4vn2000nwinp1t58fa4s | https://sign.creditxpress.com.my/api/signed/cmgxn4vn2000nwinp1t58fa4s/download | uploads/stamp-certificates/stamp-cert-cmgxn4vn2000nwinp1t58fa4s-1760874502025.pdf |

### On-Prem Orchestrator Database

```sql
SELECT "loanId", "signedFileName", "createdAt" 
FROM signed_agreements 
WHERE "loanId" IN ('cmg7h4do100aetytacum1wg6t', 'cmgxn4vn2000nwinp1t58fa4s')
ORDER BY "createdAt" DESC LIMIT 10;
```

**Result:** `0 rows` ❌

Recent signed agreements that DO exist:
```
loanId                    | signedFileName                     | createdAt
--------------------------|------------------------------------|-------------------------
cmhn2mvpr000hfei6g63yyhtn | 116_signed.pdf                     | 2025-11-06 06:57:53.024
cmhmsx5o5001h142s2ypkqmzr | 115_signed.pdf                     | 2025-11-06 02:29:30.359
cmhk90xh8008xc8f8hl428f3t | loan_cmhk90xh8008xc8f8hl428f3t... | 2025-11-04 14:22:47.872
```

## Did Recent Changes Cause This?

**NO.** Analysis of recent commits:

### Recent Changes (Nov 6, 2025)
- `f1d1864` - feat: added a button that now allows you to reupload certificate
- `3e26c2f` - Fix/admin reupload stamp
- `efca239` - Fix/admin reupload stamp

These changes only:
1. Added `pkiStampCertificateUrl` to the loan query response
2. Added UI for re-uploading stamp certificates
3. Improved state management for certificate uploads

**None of these changes affected the download endpoint logic.**

### Original Implementation (Oct 19, 2025)
- `f919f53` - feat: Implement stamping workflow for loan applications
- This commit created `backend/src/api/loan-applications-downloads.ts`
- The download logic has been the same since then

## Why The Issue Was Not Detected Earlier

1. **These specific loans were never properly signed** via the orchestrator
2. **The backend stored URLs** assuming the files would exist
3. **No validation** checks if the file actually exists before storing the URL
4. **The signing flow was incomplete** for these applications

## Solutions

### Option 1: Re-sign These Specific Loans (Recommended)

Trigger the signing workflow again for these loans so the orchestrator creates the records and files properly.

**Steps:**
1. Check if DocuSeal submissions exist
2. Re-trigger PKI signing via the orchestrator webhook
3. Ensure files are created in `/data/signed/` on on-prem
4. Verify database entries are created

### Option 2: Fix Data Inconsistency

Manually create the missing records in the orchestrator database (not recommended - data integrity issues).

### Option 3: Add Fallback Logic

Modify the backend to check if signed PDF exists before displaying download button:

```typescript
// Before showing download button
const checkSignedPdfExists = async (applicationId: string) => {
  try {
    const response = await fetch(
      `${orchestratorUrl}/api/signed/${applicationId}/download`,
      { method: 'HEAD', headers: { 'X-API-Key': apiKey } }
    );
    return response.ok;
  } catch {
    return false;
  }
};
```

## Nginx Configuration

**NOT THE ISSUE.** The nginx rate limiting changes did not affect this. Testing confirms:
- Requests reach the signing orchestrator successfully
- Rate limits are not being hit (87/100 requests remaining)
- The 404 response is generated by the application, not nginx

## Where Files Are Stored

### Signed Agreements (PKI-signed PDFs)
- **Location:** On-prem server at `/data/signed/`
- **Served by:** Signing Orchestrator API
- **URL Pattern:** `https://sign.creditxpress.com.my/api/signed/{applicationId}/download`
- **Requires:** API key authentication

### Stamp Certificates
**Two implementations exist:**

1. **OLD: Local VPS Storage** (legacy, some loans use this)
   - Path: `/root/creditxpress/backend/uploads/stamp-certificates/`
   - Example: `uploads/stamp-certificates/stamp-cert-cmgxn4vn2000nwinp1t58fa4s-1760874502025.pdf`
   - Served directly by backend

2. **NEW: On-Prem Storage** (current implementation)
   - Path: `/data/stamped/` on on-prem server
   - Uploaded via orchestrator API: `POST /api/admin/agreements/{applicationId}/upload/certificate`
   - Downloaded via: `GET /api/admin/agreements/{applicationId}/download/certificate`

## Recommendations

1. **Immediate:** Identify why these specific loans have no orchestrator records
2. **Short-term:** Add validation before storing `pkiSignedPdfUrl` to ensure file exists
3. **Long-term:** Implement health checks to detect missing files
4. **Documentation:** Update signing workflow documentation with troubleshooting steps

## Related Files

- `backend/src/api/loans.ts` - Lines 1410-1499 (download endpoint)
- `backend/src/api/admin.ts` - Lines 11806-11840, 12919-12994 (admin download)
- `backend/src/api/loan-applications-downloads.ts` - Lines 87-166 (user download)
- `on-prem/signing-orchestrator/src/routes/api.ts` - Lines 1719-1790 (orchestrator endpoint)
- `frontend/app/dashboard/loans/page.tsx` - Loan download UI
- `admin/app/dashboard/loans/page.tsx` - Admin loan download UI

## Status

**OPEN** - Awaiting decision on which solution to implement.


