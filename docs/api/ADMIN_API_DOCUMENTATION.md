# Admin API Documentation

Complete API reference for the admin panel endpoints. This documentation covers all endpoints accessible to administrators and attestors.

## Base URLs

| Service | Variable | Description |
|---------|----------|-------------|
| Backend API | `{API_BASE_URL}` | Main backend API server |
| Signing Orchestrator | `{SIGNING_BASE_URL}` | On-prem signing service (proxied via backend) |
| DocuSeal | `{DOCUSEAL_BASE_URL}` | Document signing platform |

**Example Values:**

| Environment | API Base URL | Signing URL |
|-------------|--------------|-------------|
| Production | `https://api.andas.com.my` | `https://sign.andas.com.my` |
| Development | `http://localhost:4001` | `http://localhost:4010` |

---

## Authentication & Authorization

### Authentication
All authenticated endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer {adminToken}
```

**Token Lifetimes:**
- Access Token: 15 minutes
- Refresh Token: 90 days

### Role-Based Access Control (RBAC)

| Role | Description | Access Level |
|------|-------------|--------------|
| `ADMIN` | Full system access | All endpoints |
| `ATTESTOR` | Limited admin access | Most endpoints except sensitive settings |
| `USER` | Customer role | No admin access |

---

## Table of Contents

1. [Admin Authentication](#1-admin-authentication)
2. [Dashboard & Statistics](#2-dashboard--statistics)
3. [User Management](#3-user-management)
4. [Application Management](#4-application-management)
5. [Loan Management](#5-loan-management)
6. [Repayment & Payment Management](#6-repayment--payment-management)
7. [Late Fee Management](#7-late-fee-management)
8. [Early Settlement](#8-early-settlement)
9. [Disbursement Management](#9-disbursement-management)
10. [Document Management](#10-document-management)
11. [Notification Management](#11-notification-management)
12. [Settings & Configuration](#12-settings--configuration)
13. [Internal Signers](#13-internal-signers)
14. [Admin KYC Management](#14-admin-kyc-management)
15. [Admin MTSA/PKI Management](#15-admin-mtsapki-management)
16. [Cron Jobs & System Tasks](#16-cron-jobs--system-tasks)
17. [PDF Letters & Reports](#17-pdf-letters--reports)
18. [Access & Document Logs](#18-access--document-logs)
19. [Signing Orchestrator (Admin)](#19-signing-orchestrator-admin)
20. [Health Check](#20-health-check)

---

## 1. Admin Authentication

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/login-token` | Get one-time login token | Public | `admin/app/api/admin/login/route.ts` |
| POST | `/api/admin/login` | Admin login | Public | `admin/app/api/admin/login/route.ts` |
| POST | `/api/admin/refresh` | Refresh admin token | Public | `admin/app/api/admin/refresh/route.ts` |
| POST | `/api/admin/logout` | Admin logout | Admin/Attestor | `admin/app/api/admin/logout/route.ts` |
| GET | `/api/admin/me` | Get current admin profile | Admin/Attestor | `admin/app/api/admin/me/route.ts` |
| PUT | `/api/admin/me` | Update admin profile | Admin/Attestor | `admin/app/api/admin/me/route.ts` |

### Login Flow

1. **Get Login Token**:
   ```
   GET {API_BASE_URL}/api/admin/login-token
   ```

2. **Login**:
   ```
   POST {API_BASE_URL}/api/admin/login
   Body: { "phoneNumber": "60123456789", "password": "...", "loginToken": "..." }
   ```

3. **Verify OTP** (2FA required for all admins):
   ```
   POST {API_BASE_URL}/api/auth/verify-otp
   Body: { "phoneNumber": "60123456789", "otp": "123456" }
   ```

### Rate Limiting
- Admin Login: 5 attempts per 5 minutes per IP

---

## 2. Dashboard & Statistics

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/dashboard` | Get dashboard statistics | Admin/Attestor | `admin/app/api/admin/dashboard/route.ts` |
| GET | `/api/admin/monthly-stats` | Get monthly statistics | Admin/Attestor | `admin/app/api/admin/monthly-stats/route.ts` |
| GET | `/api/admin/daily-stats` | Get daily statistics | Admin/Attestor | `admin/app/api/admin/daily-stats/route.ts` |

---

## 3. User Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/users` | Get all users | Admin/Attestor | - |
| GET | `/api/admin/users/:id` | Get specific user | Admin/Attestor | - |
| PUT | `/api/admin/users/:id` | Update user | Admin | - |
| DELETE | `/api/admin/users/:id` | Delete user | Admin | - |
| POST | `/api/admin/users` | Create new user | Admin | - |

---

## 4. Application Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/applications` | Get all applications | Admin/Attestor | `admin/app/api/admin/applications/route.ts` |
| GET | `/api/admin/applications/counts` | Get application counts | Admin/Attestor | `admin/app/api/admin/applications/counts/route.ts` |
| GET | `/api/admin/applications/:id` | Get specific application | Admin/Attestor | `admin/app/api/admin/applications/[id]/route.ts` |
| PATCH | `/api/admin/applications/:id/status` | Update application status | Admin/Attestor | `admin/app/api/admin/applications/[id]/status/route.ts` |
| GET | `/api/admin/applications/:id/history` | Get application history | Admin/Attestor | `admin/app/api/admin/applications/[id]/history/route.ts` |
| POST | `/api/admin/applications/:id/fresh-offer` | Create fresh offer | Admin/Attestor | - |
| POST | `/api/admin/applications/:id/disburse` | Disburse loan | Admin/Attestor | `admin/app/api/admin/applications/[id]/disburse/route.ts` |
| POST | `/api/admin/applications/:id/complete-attestation` | Complete attestation | Admin/Attestor | - |
| GET | `/api/admin/applications/live-attestations` | Get live attestations | Admin/Attestor | `admin/app/api/admin/applications/live-attestations/route.ts` |
| POST | `/api/admin/applications/:id/complete-live-attestation` | Complete live attestation | Admin/Attestor | `admin/app/api/admin/applications/[id]/complete-live-attestation/route.ts` |
| GET | `/api/admin/applications/:applicationId/signatures` | Get application signatures | Admin/Attestor | `admin/app/api/admin/applications/[id]/signatures/route.ts` |
| POST | `/api/admin/applications/pin-sign` | PIN-based signing | Admin/Attestor | `admin/app/api/admin/applications/pin-sign/route.ts` |
| GET | `/api/admin/applications/:id/unsigned-agreement` | Get unsigned agreement URL | Admin/Attestor | `admin/app/api/admin/applications/[id]/unsigned-agreement/route.ts` |
| GET | `/api/admin/applications/:id/signed-agreement` | Download signed agreement | Admin/Attestor | `admin/app/api/admin/applications/[id]/signed-agreement/route.ts` |
| GET | `/api/admin/applications/:id/stamp-certificate` | Download stamp certificate | Admin/Attestor | `admin/app/api/admin/applications/[id]/stamp-certificate/route.ts` |
| POST | `/api/admin/applications/:id/upload-stamp-certificate` | Upload stamp certificate | Admin/Attestor | `admin/app/api/admin/applications/[id]/upload-stamp-certificate/route.ts` |
| POST | `/api/admin/applications/:id/upload-disbursement-slip` | Upload disbursement slip | Admin/Attestor | `admin/app/api/admin/applications/[id]/upload-disbursement-slip/route.ts` |
| POST | `/api/admin/applications/:id/confirm-stamping` | Confirm stamping complete | Admin/Attestor | `admin/app/api/admin/applications/[id]/confirm-stamping/route.ts` |

---

## 5. Loan Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/loans` | Get all loans | Admin/Attestor | `admin/app/api/admin/loans/route.ts` |
| GET | `/api/admin/loans/:id` | Get specific loan | Admin/Attestor | `admin/app/api/admin/loans/[id]/route.ts` |
| GET | `/api/admin/loans/:id/repayments` | Get loan repayments | Admin/Attestor | `admin/app/api/admin/loans/[id]/repayments/route.ts` |
| GET | `/api/admin/loans/:id/transactions` | Get loan transactions | Admin/Attestor | - |
| GET | `/api/admin/loans/pending-discharge` | Get loans pending discharge | Admin/Attestor | - |
| POST | `/api/admin/loans/:id/request-discharge` | Request loan discharge | Admin/Attestor | `admin/app/api/admin/loans/[id]/request-discharge/route.ts` |
| POST | `/api/admin/loans/:id/approve-discharge` | Approve loan discharge | Admin/Attestor | `admin/app/api/admin/loans/[id]/approve-discharge/route.ts` |
| POST | `/api/admin/loans/:id/reject-discharge` | Reject loan discharge | Admin/Attestor | `admin/app/api/admin/loans/[id]/reject-discharge/route.ts` |
| POST | `/api/admin/loans/sync-balances` | Sync all loan balances | Admin | - |
| GET | `/api/admin/loans/:loanId/signatures` | Get loan signatures | Admin/Attestor | - |
| GET | `/api/admin/loans/:loanId/download-agreement` | Download loan agreement | Admin/Attestor | `admin/app/api/admin/loans/[id]/download-agreement/route.ts` |
| GET | `/api/admin/loans/:loanId/download-stamped-agreement` | Download stamped agreement | Admin/Attestor | `admin/app/api/admin/loans/[id]/download-stamped-agreement/route.ts` |
| GET | `/api/admin/loans/:loanId/download-stamp-certificate` | Download stamp certificate | Admin/Attestor | `admin/app/api/admin/loans/[id]/download-stamp-certificate/route.ts` |
| POST | `/api/admin/loans/:id/upload-stamped-agreement` | Upload stamped agreement | Admin/Attestor | `admin/app/api/admin/loans/[id]/upload-stamped-agreement/route.ts` |
| POST | `/api/admin/loans/:id/upload-stamp-certificate` | Upload stamp certificate | Admin/Attestor | `admin/app/api/admin/loans/[id]/upload-stamp-certificate/route.ts` |
| GET | `/api/admin/:loanId/lampiran-a` | Get Lampiran A document | Admin | `admin/app/api/admin/loans/[id]/lampiran-a/route.ts` |

---

## 6. Repayment & Payment Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/repayments` | Get all repayments | Admin/Attestor | - |
| GET | `/api/admin/repayments/pending` | Get pending repayments | Admin/Attestor | `admin/app/api/admin/repayments/pending/route.ts` |
| POST | `/api/admin/repayments/:id/approve` | Approve repayment | Admin/Attestor | `admin/app/api/admin/repayments/[id]/approve/route.ts` |
| POST | `/api/admin/repayments/:id/reject` | Reject repayment | Admin/Attestor | `admin/app/api/admin/repayments/[id]/reject/route.ts` |
| POST | `/api/admin/payments/manual` | Create manual payment | Admin/Attestor | - |
| POST | `/api/admin/payments/csv-upload` | Upload payment CSV | Admin/Attestor | `admin/app/api/admin/payments/csv-upload/route.ts` |
| POST | `/api/admin/payments/csv-batch-approve` | Batch approve CSV payments | Admin/Attestor | `admin/app/api/admin/payments/csv-batch-approve/route.ts` |
| GET | `/api/admin/payments/pending` | Get pending payments | Admin/Attestor | `admin/app/api/admin/payments/pending/route.ts` |
| POST | `/api/admin/payments/:id/approve` | Approve payment | Admin/Attestor | `admin/app/api/admin/payments/[id]/approve/route.ts` |
| POST | `/api/admin/payments/:id/reject` | Reject payment | Admin/Attestor | `admin/app/api/admin/payments/[id]/reject/route.ts` |

### Receipts

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| POST | `/api/admin/receipts/generate` | Generate receipt | Admin/Attestor | - |
| GET | `/api/admin/receipts/:receiptId/download` | Download receipt PDF | Admin/Attestor | `admin/app/api/admin/receipts/[id]/download/route.ts` |
| GET | `/api/admin/receipts/repayment/:repaymentId` | Get receipts for repayment | Admin/Attestor | - |
| GET | `/api/admin/receipts` | Get all receipts | Admin/Attestor | - |
| DELETE | `/api/admin/receipts/:receiptId` | Delete receipt | Admin | - |

---

## 7. Late Fee Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/late-fees` | Get all late fees | Admin/Attestor | - |
| GET | `/api/admin/late-fees/status` | Get late fee processing status | Admin/Attestor | - |
| POST | `/api/admin/late-fees/process` | Process late fees | Admin | - |
| GET | `/api/admin/late-fees/repayment/:repaymentId` | Get repayment late fees | Admin/Attestor | - |
| GET | `/api/admin/late-fees/repayment/:repaymentId/total-due` | Get total due amount | Admin/Attestor | - |
| POST | `/api/admin/late-fees/repayment/:repaymentId/handle-payment` | Handle late fee payment | Admin/Attestor | - |
| POST | `/api/admin/late-fees/repayment/:repaymentId/waive` | Waive late fees | Admin | - |
| GET | `/api/admin/late-fees/logs` | Get late fee processing logs | Admin/Attestor | - |
| DELETE | `/api/admin/late-fees/alerts` | Clear late fee alerts | Admin | - |

---

## 8. Early Settlement

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/early-settlement/pending` | Get pending early settlements | Admin/Attestor | `admin/app/api/admin/early-settlement/pending/route.ts` |
| GET | `/api/admin/early-settlement/:transactionId` | Get specific early settlement | Admin/Attestor | `admin/app/api/admin/early-settlement/[transactionId]/route.ts` |
| POST | `/api/admin/early-settlement/:transactionId/approve` | Approve early settlement | Admin/Attestor | `admin/app/api/admin/early-settlement/[transactionId]/approve/route.ts` |
| POST | `/api/admin/early-settlement/:transactionId/reject` | Reject early settlement | Admin/Attestor | `admin/app/api/admin/early-settlement/[transactionId]/reject/route.ts` |

---

## 9. Disbursement Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/disbursements` | Get all disbursements | Admin/Attestor | `admin/app/api/admin/disbursements/route.ts` |
| GET | `/api/admin/disbursements/:applicationId/payment-slip` | Download payment slip | Admin/Attestor | `admin/app/api/admin/disbursements/[applicationId]/payment-slip/route.ts` |
| POST | `/api/admin/ensure-wallets` | Ensure all users have wallets | Admin | `admin/app/api/admin/ensure-wallets/route.ts` |

---

## 10. Document Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| PATCH | `/api/admin/documents/:id/status` | Update document status | Admin/Attestor | `admin/app/api/admin/documents/[id]/status/route.ts` |

---

## 11. Notification Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/notifications` | Get all notifications | Admin/Attestor | - |
| GET | `/api/admin/notification-templates` | Get notification templates | Admin/Attestor | - |
| POST | `/api/admin/notification-templates` | Create notification template | Admin | - |
| PUT | `/api/admin/notification-templates/:id` | Update notification template | Admin | - |
| DELETE | `/api/admin/notification-templates/:id` | Delete notification template | Admin | - |
| GET | `/api/admin/notification-groups` | Get notification groups | Admin/Attestor | - |
| POST | `/api/admin/notification-groups` | Create notification group | Admin | - |
| PUT | `/api/admin/notification-groups/:id` | Update notification group | Admin | - |
| DELETE | `/api/admin/notification-groups/:id` | Delete notification group | Admin | - |
| POST | `/api/admin/send-notification` | Send notification | Admin/Attestor | - |
| POST | `/api/admin/trigger-upcoming-payment-notifications` | Trigger payment notifications | Admin | - |
| POST | `/api/admin/trigger-payment-notifications` | Trigger all payment notifications | Admin | - |

---

## 12. Settings & Configuration

### System Settings

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/settings` | Get all settings | Admin | `admin/app/api/admin/settings/route.ts` |
| GET | `/api/admin/settings/categories` | Get settings by category | Admin | `admin/app/api/admin/settings/categories/route.ts` |
| PUT | `/api/admin/settings` | Update settings | Admin | `admin/app/api/admin/settings/route.ts` |

### Bank Accounts

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/bank-accounts` | Get all bank accounts | Admin | `admin/app/api/admin/bank-accounts/route.ts` |
| POST | `/api/admin/bank-accounts` | Create bank account | Admin | `admin/app/api/admin/bank-accounts/route.ts` |
| PUT | `/api/admin/bank-accounts/:id` | Update bank account | Admin | `admin/app/api/admin/bank-accounts/[id]/route.ts` |
| DELETE | `/api/admin/bank-accounts/:id` | Delete bank account | Admin | `admin/app/api/admin/bank-accounts/[id]/route.ts` |
| POST | `/api/admin/bank-accounts/:id/set-default` | Set as default account | Admin | `admin/app/api/admin/bank-accounts/[id]/set-default/route.ts` |

### Company Settings

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/company-settings` | Get company settings | Admin | `admin/app/api/admin/company-settings/route.ts` |
| POST | `/api/admin/company-settings` | Create/update company settings | Admin | `admin/app/api/admin/company-settings/route.ts` |
| DELETE | `/api/admin/company-settings/:id` | Delete company setting | Admin | - |

### Products

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/products` | Get all products (including inactive) | Admin | - |
| POST | `/api/products` | Create product | Admin | - |
| PATCH | `/api/products/:id` | Update product | Admin | - |
| DELETE | `/api/products/:id` | Delete product | Admin | - |

---

## 13. Internal Signers

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/internal-signers` | Get all internal signers | Admin/Attestor | `admin/app/api/admin/internal-signers/route.ts` |
| GET | `/api/admin/internal-signers/lookup/:icNumber` | Lookup signer by IC | Admin/Attestor | `admin/app/api/admin/internal-signers/lookup/[icNumber]/route.ts` |
| POST | `/api/admin/internal-signers` | Create internal signer | Admin/Attestor | `admin/app/api/admin/internal-signers/route.ts` |
| POST | `/api/admin/internal-signers/:id/verify-pin` | Verify signer PIN | Admin/Attestor | `admin/app/api/admin/internal-signers/[id]/verify-pin/route.ts` |
| PUT | `/api/admin/internal-signers/:id` | Update internal signer | Admin/Attestor | `admin/app/api/admin/internal-signers/[id]/route.ts` |
| DELETE | `/api/admin/internal-signers/:id` | Delete internal signer | Admin | `admin/app/api/admin/internal-signers/[id]/route.ts` |
| POST | `/api/admin/internal-signers/refresh` | Refresh signer cache | Admin/Attestor | `admin/app/api/admin/internal-signers/refresh/route.ts` |

---

## 14. Admin KYC Management

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/kyc/status` | Get KYC overview status | Admin/Attestor | `admin/app/api/admin/kyc/status/route.ts` |
| GET | `/api/admin/kyc/:kycId/status` | Get specific KYC status | Admin/Attestor | `admin/app/api/admin/kyc/status/[kycId]/route.ts` |
| POST | `/api/admin/kyc/start-ctos` | Start CTOS for user | Admin/Attestor | `admin/app/api/admin/kyc/start/route.ts` |
| GET | `/api/admin/kyc/admin-ctos-status` | Get admin CTOS status | Admin/Attestor | `admin/app/api/admin/kyc/admin-ctos-status/route.ts` |
| GET | `/api/admin/kyc/images` | Get KYC images | Admin/Attestor | `admin/app/api/admin/kyc/images/route.ts` |
| GET | `/api/admin/kyc/session-status/:kycSessionId` | Get session status | Admin/Attestor | `admin/app/api/admin/kyc/session-status/[kycSessionId]/route.ts` |

---

## 15. Admin MTSA/PKI Management

These endpoints are for certificate management via the Signing Orchestrator.

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/mtsa/cert-info/:userId` | Get user certificate info | Admin/Attestor | `admin/app/api/admin/mtsa/cert-info/[userId]/route.ts` |
| POST | `/api/admin/mtsa/verify-cert-pin` | Verify certificate PIN | Admin/Attestor | `admin/app/api/admin/mtsa/verify-cert-pin/route.ts` |
| POST | `/api/admin/mtsa/reset-cert-pin` | Reset certificate PIN | Admin/Attestor | `admin/app/api/admin/mtsa/reset-cert-pin/route.ts` |
| POST | `/api/admin/mtsa/request-otp` | Request signing OTP | Admin/Attestor | `admin/app/api/admin/mtsa/request-otp/route.ts` |
| POST | `/api/admin/mtsa/request-certificate` | Request new certificate | Admin/Attestor | `admin/app/api/admin/mtsa/request-certificate/route.ts` |
| POST | `/api/admin/mtsa/revoke-certificate` | Revoke user certificate | Admin | - |

---

## 16. Cron Jobs & System Tasks

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/cron/status` | Get cron job status | Admin/Attestor | - |
| POST | `/api/admin/cron/trigger-late-fee-processing` | Trigger late fee processing | Admin/Attestor | - |
| POST | `/api/admin/cron/trigger-default-processing` | Trigger default processing | Admin/Attestor | - |
| POST | `/api/admin/cron/trigger-payment-notifications` | Trigger payment notifications | Admin/Attestor | - |

---

## 17. PDF Letters & Reports

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/:loanId/pdf-letters` | Get PDF letters for loan | Admin | `admin/app/api/admin/loans/[id]/pdf-letters/route.ts` |
| GET | `/api/admin/:loanId/borrower-info` | Get borrower information | Admin | - |
| POST | `/api/admin/:loanId/generate-pdf-letter` | Generate PDF letter | Admin | - |
| GET | `/api/admin/:loanId/pdf-letters/:filename/download` | Download PDF letter | Admin | `admin/app/api/admin/loans/[id]/pdf-letters/[filename]/download/route.ts` |

### Credit Reports

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/credit-reports/:userId` | Get user credit reports | Admin/Attestor | `admin/app/api/admin/credit-reports/[userId]/route.ts` |
| POST | `/api/admin/credit-reports/request` | Request credit report | Admin/Attestor | `admin/app/api/admin/credit-reports/request/route.ts` |
| POST | `/api/admin/credit-reports/confirm` | Confirm credit report | Admin/Attestor | `admin/app/api/admin/credit-reports/confirm/route.ts` |
| POST | `/api/admin/credit-reports/fetch` | Fetch credit report | Admin/Attestor | `admin/app/api/admin/credit-reports/fetch/route.ts` |
| POST | `/api/admin/credit-reports/request-and-confirm` | Request and confirm report | Admin/Attestor | `admin/app/api/admin/credit-reports/request-and-confirm/route.ts` |
| GET | `/api/admin/credit-reports/pdf/:reportId` | Download report PDF | Admin/Attestor | `admin/app/api/admin/credit-reports/pdf/[reportId]/route.ts` |
| GET | `/api/admin/credit-reports/cache/:userId` | Get cached report | Admin/Attestor | `admin/app/api/admin/credit-reports/cache/[userId]/route.ts` |

---

## 18. Access & Document Logs

### Access Logs

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/access-logs` | Get admin access logs | Admin | `admin/app/api/admin/access-logs/route.ts` |
| GET | `/api/admin/access-logs/export` | Export access logs | Admin | `admin/app/api/admin/access-logs/export/route.ts` |

### Document Logs

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/document-logs` | Get document logs | Admin | `admin/app/api/admin/document-logs/route.ts` |
| POST | `/api/admin/document-logs/scan` | Scan for documents | Admin | `admin/app/api/admin/document-logs/scan/route.ts` |
| GET | `/api/admin/document-logs/export` | Export document logs | Admin | `admin/app/api/admin/document-logs/export/route.ts` |

---

## 19. Signing Orchestrator (Admin)

These endpoints proxy to the on-prem Signing Orchestrator for document signing operations.

### DocuSeal Integration

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| POST | `/api/docuseal/initiate-loan-signing` | Initiate loan signing | Admin/Attestor | - |
| POST | `/api/docuseal/initiate-application-signing` | Initiate application signing | Admin/Attestor | - |
| POST | `/api/docuseal/admin/initiate-loan-signing` | Admin initiate signing | Admin/Attestor | - |
| GET | `/api/docuseal/submission/:submissionId` | Get submission status | Admin/Attestor | - |
| GET | `/api/docuseal/admin/templates` | Get DocuSeal templates | Admin/Attestor | - |
| POST | `/api/docuseal/webhook` | DocuSeal webhook receiver | Webhook | - |
| GET | `/api/docuseal/download/:submissionId` | Download DocuSeal document | Admin/Attestor | - |
| GET | `/api/docuseal/admin/download/:submissionId` | Admin download document | Admin/Attestor | - |
| GET | `/api/docuseal/admin/webhooks` | Get webhook configurations | Admin | - |
| POST | `/api/docuseal/admin/configure-webhook` | Configure webhooks | Admin | - |
| POST | `/api/docuseal/test-connection-simple` | Test DocuSeal connection | Public | - |

### Signing Orchestrator Direct APIs

The backend proxies these to `{SIGNING_BASE_URL}`:

| Method | Backend Proxy | Orchestrator Endpoint | Description | Auth |
|--------|--------------|----------------------|-------------|------|
| GET | Via `/api/admin/loans/:loanId/download-agreement` | `/api/signed/:applicationId/download` | Download signed PDF | API Key |
| POST | Via `/api/admin/loans/:id/upload-stamped-agreement` | `/api/admin/agreements/:applicationId/upload/stamped` | Upload stamped agreement | API Key |
| POST | Via `/api/admin/loans/:id/upload-stamp-certificate` | `/api/admin/agreements/:applicationId/upload/certificate` | Upload stamp certificate | API Key |
| GET | Via `/api/admin/loans/:loanId/download-stamped-agreement` | `/api/admin/agreements/:applicationId/download/stamped` | Download stamped agreement | API Key |
| GET | Via `/api/admin/loans/:loanId/download-stamp-certificate` | `/api/admin/agreements/:applicationId/download/certificate` | Download stamp certificate | API Key |

### Health Checks (Signing Orchestrator)

These are direct endpoints on the Signing Orchestrator:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `{SIGNING_BASE_URL}/health` | Basic health check |
| GET | `{SIGNING_BASE_URL}/health/detailed` | Detailed health check |
| GET | `{SIGNING_BASE_URL}/health/ready` | Kubernetes readiness probe |
| GET | `{SIGNING_BASE_URL}/health/live` | Kubernetes liveness probe |

---

## 20. Health Check

### Endpoints

| Method | Endpoint | Description | Role | Admin Frontend Route |
|--------|----------|-------------|------|---------------------|
| GET | `/api/admin/health-check` | System health check | Admin/Attestor | - |
| GET | `/api/health` | Basic API health check | Public | `admin/app/api/health/route.ts` |

---

## Error Responses

All endpoints return standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed message",
  "success": false
}
```

---

## Security Features

### Two-Factor Authentication
- Required for all admin logins
- OTP sent via WhatsApp after password verification

### Login Token (CSRF Protection)
- One-time use token generated before login
- Expires after 6 minutes
- IP-address bound

### Rate Limiting
- Admin Login: 5 attempts per 5 minutes per IP

### Access Logging
- All admin logins are logged
- Logs include: user ID, name, phone, role, IP address, user agent, timestamp

### Role-Based Access
- Endpoints enforce minimum required role
- Some sensitive operations require `ADMIN` role

---

## Related Documentation

- [CUSTOMER_API_DOCUMENTATION.md](./CUSTOMER_API_DOCUMENTATION.md) - Customer endpoints
- [AUTHENTICATION_DOCUMENTATION.md](./AUTHENTICATION_DOCUMENTATION.md) - Auth flows
- [Pentest Documentation](../pentest/) - Security testing resources

---

## Changelog

### January 2025
- Added early settlement management endpoints
- Added disbursement slip upload/download
- Added internal signers management
- Added admin MTSA/PKI endpoints
- Added credit report management
- Added access and document logging
- Added cron job management endpoints
