# Customer API Documentation

Complete API reference for the customer-facing endpoints. This documentation covers all endpoints accessible to end users through the frontend application.

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

## Authentication

All authenticated endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer {accessToken}
```

**Token Lifetimes:**
- Access Token: 15 minutes
- Refresh Token: 90 days

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Onboarding](#3-onboarding)
4. [Products](#4-products)
5. [Loan Applications](#5-loan-applications)
6. [Loans](#6-loans)
7. [Wallet](#7-wallet)
8. [Notifications](#8-notifications)
9. [KYC (Know Your Customer)](#9-kyc-know-your-customer)
10. [CTOS Integration](#10-ctos-integration)
11. [PKI/MTSA Signing](#11-pkimtsa-signing)
12. [Settings & Bank Accounts](#12-settings--bank-accounts)

---

## 1. Authentication

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/auth/login-token` | Get one-time login token (CSRF protection) | No | `frontend/app/api/auth/login/route.ts` |
| POST | `/api/auth/login` | Login with phone/password | No | `frontend/app/api/auth/login/route.ts` |
| POST | `/api/auth/signup` | Register new user | No | `frontend/app/api/auth/signup/route.ts` |
| POST | `/api/auth/verify-otp` | Verify OTP for signup/login | No | `frontend/app/api/auth/verify-otp/route.ts` |
| POST | `/api/auth/resend-otp` | Resend OTP code | No | `frontend/app/api/auth/resend-otp/route.ts` |
| POST | `/api/auth/refresh` | Refresh access token | No | `frontend/app/api/auth/refresh/route.ts` |
| POST | `/api/auth/logout` | Logout user | Yes | `frontend/app/api/auth/logout/route.ts` |
| POST | `/api/auth/forgot-password` | Request password reset OTP | No | `frontend/app/api/auth/forgot-password/route.ts` |
| POST | `/api/auth/verify-reset-otp` | Verify password reset OTP | No | `frontend/app/api/auth/verify-reset-otp/route.ts` |
| POST | `/api/auth/reset-password` | Reset password with token | No | `frontend/app/api/auth/reset-password/route.ts` |

### Login Flow

1. **Get Login Token** (optional security enhancement):
   ```
   GET {API_BASE_URL}/api/auth/login-token
   ```
   Response: `{ "loginToken": "hex_string_64_chars" }`

2. **Login**:
   ```
   POST {API_BASE_URL}/api/auth/login
   Body: { "phoneNumber": "60123456789", "password": "...", "loginToken": "..." }
   ```

3. **If phone verification required** (403 response):
   ```
   POST {API_BASE_URL}/api/auth/verify-otp
   Body: { "phoneNumber": "60123456789", "otp": "123456" }
   ```

### Signup Flow

1. **Register**:
   ```
   POST {API_BASE_URL}/api/auth/signup
   Body: { "phoneNumber": "60123456789", "password": "SecurePass1!" }
   ```

2. **Verify OTP**:
   ```
   POST {API_BASE_URL}/api/auth/verify-otp
   Body: { "phoneNumber": "60123456789", "otp": "123456" }
   ```

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 special character
- No spaces allowed

### Phone Number Format
- E.164 format WITHOUT `+` symbol
- Example: `60123456789` (Malaysia)

### Rate Limiting
- Login: 5 attempts per 5 minutes per IP
- OTP Resend: 60-second cooldown

---

## 2. User Management

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/users/me` | Get current user profile | Yes | `frontend/app/api/users/me/route.ts` |
| PUT | `/api/users/me` | Update user profile | Yes | `frontend/app/api/users/me/route.ts` |
| PUT | `/api/users/me/password` | Change password | Yes | `frontend/app/api/users/me/password/route.ts` |
| GET | `/api/users/me/documents` | Get user's documents | Yes | `frontend/app/api/users/me/documents/route.ts` |
| GET | `/api/users/me/documents/:documentId` | Get specific document | Yes | `frontend/app/api/users/me/documents/[documentId]/route.ts` |
| GET | `/api/users/me/wallet` | Get or create wallet | Yes | `frontend/app/api/users/me/wallet/route.ts` |
| POST | `/api/users/me/phone/change-request` | Request phone number change | Yes | `frontend/app/api/users/me/phone/change-request/route.ts` |
| POST | `/api/users/me/phone/verify-current` | Verify current phone with OTP | Yes | `frontend/app/api/users/me/phone/verify-current/route.ts` |
| POST | `/api/users/me/phone/verify-new` | Verify new phone with OTP | Yes | `frontend/app/api/users/me/phone/verify-new/route.ts` |

---

## 3. Onboarding

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/onboarding` | Get current onboarding step/status | Yes | `frontend/app/api/onboarding/route.ts` |
| POST | `/api/onboarding` | Submit onboarding data | Yes | `frontend/app/api/onboarding/route.ts` |

### Onboarding Steps
1. Personal Information
2. Employment Information
3. Bank Information
4. Complete

---

## 4. Products

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/products` | Get all active loan products | No | `frontend/app/api/products/route.ts` |
| GET | `/api/products/:id` | Get specific product by ID | No | `frontend/app/api/products/[id]/route.ts` |

---

## 5. Loan Applications

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/loan-applications` | Get user's loan applications | Yes | `frontend/app/api/loan-applications/route.ts` |
| POST | `/api/loan-applications` | Create new loan application | Yes | `frontend/app/api/loan-applications/route.ts` |
| GET | `/api/loan-applications/:id` | Get specific application | Yes | `frontend/app/api/loan-applications/[id]/route.ts` |
| PATCH | `/api/loan-applications/:id` | Update application | Yes | `frontend/app/api/loan-applications/[id]/route.ts` |
| DELETE | `/api/loan-applications/:id` | Delete incomplete application | Yes | - |
| PATCH | `/api/loan-applications/:id/step` | Update application step | Yes | `frontend/app/api/loan-applications/[id]/step/route.ts` |
| PATCH | `/api/loan-applications/:id/status` | Update application status | Yes | `frontend/app/api/loan-applications/[id]/status/route.ts` |
| POST | `/api/loan-applications/:id/documents` | Upload documents | Yes | `frontend/app/api/loan-applications/[id]/documents/route.ts` |
| GET | `/api/loan-applications/:id/documents` | Get application documents | Yes | `frontend/app/api/loan-applications/[id]/documents/route.ts` |
| GET | `/api/loan-applications/:id/documents/:documentId` | Get specific document | Yes | `frontend/app/api/loan-applications/[id]/documents/[documentId]/route.ts` |
| PATCH | `/api/loan-applications/:id/documents/:documentId` | Update document status | Yes | - |
| DELETE | `/api/loan-applications/:id/documents/:documentId` | Delete document | Yes | - |
| POST | `/api/loan-applications/:id/complete-attestation` | Complete attestation | Yes | - |
| GET | `/api/loan-applications/:id/history` | Get application history | Yes | `frontend/app/api/loan-applications/[id]/history/route.ts` |
| POST | `/api/loan-applications/:id/request-live-call` | Request live attestation | Yes | `frontend/app/api/loan-applications/[id]/request-live-call/route.ts` |
| POST | `/api/loan-applications/:id/link-documents` | Link existing documents | Yes | `frontend/app/api/loan-applications/[id]/link-documents/route.ts` |
| POST | `/api/loan-applications/:id/fresh-offer-response` | Respond to fresh offer | Yes | `frontend/app/api/loan-applications/[id]/fresh-offer-response/route.ts` |
| GET | `/api/loan-applications/:id/kyc-status` | Get KYC status | Yes | - |
| GET | `/api/loan-applications/:applicationId/signing-url` | Get DocuSeal signing URL | Yes | - |
| GET | `/api/loan-applications/:applicationId/unsigned-agreement` | Get unsigned agreement URL | Yes | `frontend/app/api/loan-applications/[id]/unsigned-agreement/route.ts` |
| GET | `/api/loan-applications/:applicationId/signed-agreement` | Download signed agreement PDF | Yes | `frontend/app/api/loan-applications/[id]/signed-agreement/route.ts` |
| GET | `/api/loan-applications/:applicationId/stamp-certificate` | Download stamp certificate | Yes | `frontend/app/api/loan-applications/[id]/stamp-certificate/route.ts` |

### Application Statuses

| Status | Description |
|--------|-------------|
| `INCOMPLETE` | Application started but not complete |
| `PENDING_APP_FEE` | Waiting for application fee |
| `PENDING_PROFILE_CONFIRMATION` | Profile needs confirmation |
| `PENDING_KYC` | KYC verification pending |
| `PENDING_APPROVAL` | Under review |
| `PENDING_FRESH_OFFER` | Fresh offer pending |
| `PENDING_ATTESTATION` | Attestation required |
| `PENDING_SIGNATURE` | Document signing required |
| `PENDING_PKI_SIGNING` | PKI digital signing in progress |
| `PENDING_SIGNING_COMPANY_WITNESS` | Waiting for company/witness signatures |
| `PENDING_STAMPING` | Waiting for stamp certificate |
| `PENDING_DISBURSEMENT` | Ready for disbursement |
| `ACTIVE` | Loan active |
| `REJECTED` | Application rejected |
| `CANCELLED` | Application cancelled |

---

## 6. Loans

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/loans` | Get user's loans | Yes | `frontend/app/api/loans/route.ts` |
| GET | `/api/loans/:id` | Get specific loan details | Yes | - |
| GET | `/api/loans/:id/repayments` | Get repayment schedule | Yes | `frontend/app/api/loans/[id]/repayments/route.ts` |
| GET | `/api/loans/:id/transactions` | Get loan transactions | Yes | `frontend/app/api/loans/[id]/transactions/route.ts` |
| GET | `/api/loans/:id/late-fees` | Get late fee information | Yes | `frontend/app/api/loans/[id]/late-fees/route.ts` |
| POST | `/api/loans/:id/early-settlement/quote` | Get early settlement quote | Yes | `frontend/app/api/loans/[id]/early-settlement/quote/route.ts` |
| POST | `/api/loans/:id/early-settlement/request` | Request early settlement | Yes | `frontend/app/api/loans/[id]/early-settlement/request/route.ts` |
| GET | `/api/loans/receipt/:receiptId` | Get payment receipt (public) | No | - |
| GET | `/api/loans/:loanId/receipts/:receiptId/download` | Download receipt PDF | Yes | - |
| GET | `/api/loans/:loanId/download-agreement` | Download signed agreement | Yes | - |
| GET | `/api/loans/:loanId/download-stamped-agreement` | Download stamped agreement | Yes | - |
| GET | `/api/loans/:loanId/download-stamp-certificate` | Download stamp certificate | Yes | - |
| GET | `/api/loans/:loanId/download-disbursement-slip` | Download disbursement slip | Yes | `frontend/app/api/loans/[id]/disbursement-slip/route.ts` |

### Loan Statuses

| Status | Description |
|--------|-------------|
| `ACTIVE` | Loan is active |
| `OVERDUE` | Loan has overdue payments |
| `PENDING_DISCHARGE` | Pending loan discharge |
| `PENDING_EARLY_SETTLEMENT` | Early settlement requested |
| `DISCHARGED` | Loan fully paid |
| `DEFAULT` | Loan in default |

---

## 7. Wallet

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/wallet` | Get wallet balance and info | Yes | `frontend/app/api/wallet/route.ts` |
| GET | `/api/wallet/transactions` | Get transaction history | Yes | `frontend/app/api/wallet/transactions/route.ts` |
| POST | `/api/wallet/deposit` | Create deposit transaction | Yes | `frontend/app/api/wallet/deposit/route.ts` |
| POST | `/api/wallet/withdraw` | Create withdrawal transaction | Yes | `frontend/app/api/wallet/withdraw/route.ts` |
| POST | `/api/wallet/repay-loan` | Repay loan from wallet | Yes | `frontend/app/api/wallet/repay-loan/route.ts` |
| PATCH | `/api/wallet/transactions/:id/process` | Process pending transaction | Yes | - |

---

## 8. Notifications

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/notifications` | Get user notifications | Yes | `frontend/app/api/notifications/route.ts` |
| PATCH | `/api/notifications` | Mark notifications as read | Yes | `frontend/app/api/notifications/route.ts` |
| DELETE | `/api/notifications/:id` | Delete notification | Yes | `frontend/app/api/notifications/[id]/route.ts` |

---

## 9. KYC (Know Your Customer)

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| POST | `/api/kyc/start-ctos` | Start CTOS eKYC process | Yes | - |
| POST | `/api/kyc/start` | Start or reuse KYC session | Yes | `frontend/app/api/kyc/start/route.ts` |
| POST | `/api/kyc/:kycId/upload` | Upload KYC documents | Yes* | - |
| POST | `/api/kyc/:kycId/process` | Process KYC verification | Yes* | - |
| GET | `/api/kyc/:kycId/ctos-status` | Get CTOS verification status | Yes* | - |
| GET | `/api/kyc/:kycId/status` | Get KYC session status | Yes* | - |
| GET | `/api/kyc/:kycId/details` | Get KYC session details | Yes* | - |
| GET | `/api/kyc/images` | Get user's KYC images | Yes | `frontend/app/api/kyc/images/route.ts` |
| GET | `/api/kyc/images/:imageId` | Get specific KYC image | Yes | `frontend/app/api/kyc/images/[imageId]/route.ts` |
| POST | `/api/kyc/:kycId/accept` | Accept KYC results | Yes* | - |
| GET | `/api/kyc/user-documents` | Get user's KYC documents | Yes | - |
| GET | `/api/kyc/user-ctos-status` | Get user's CTOS status | Yes | - |
| GET | `/api/kyc/session-status/:kycSessionId` | Poll KYC session status | Yes | - |

*Note: Some KYC endpoints accept either JWT token or one-time KYC token (`authenticateKycOrAuth`)

---

## 10. CTOS Integration

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| POST | `/api/ctos/create-transaction` | Create CTOS eKYC transaction | No | - |
| POST | `/api/ctos/status` | Get CTOS transaction status | No | - |
| GET | `/api/ctos/webhook` | CTOS webhook (GET test) | No | - |
| POST | `/api/ctos/webhook` | CTOS webhook receiver | No | - |
| GET | `/api/ctos/session/:id` | Get CTOS session | No | - |

---

## 11. PKI/MTSA Signing

These endpoints are used for digital certificate signing. The backend proxies requests to the on-prem Signing Orchestrator.

### MTSA Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/mtsa/cert-info/:userId` | Get certificate info | Yes | `frontend/app/api/mtsa/certificate/[userId]/route.ts` |
| POST | `/api/mtsa/request-otp` | Request signing OTP | Yes | `frontend/app/api/mtsa/request-otp/route.ts` |
| POST | `/api/mtsa/verify-otp` | Verify signing OTP | Yes | `frontend/app/api/mtsa/verify-otp/route.ts` |
| POST | `/api/mtsa/request-certificate` | Request new certificate | Yes | `frontend/app/api/mtsa/request-certificate/route.ts` |

### PKI Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| POST | `/api/pki/check-certificate` | Check certificate status | Yes | - |
| POST | `/api/pki/request-otp` | Request PKI OTP | Yes | - |
| POST | `/api/pki/complete-signing` | Complete signing process | Yes | - |
| POST | `/api/pki/sign-pdf` | Sign PDF document | Yes | - |
| GET | `/api/pki/session/:sessionId` | Get signing session | Yes | - |

---

## 12. Settings & Bank Accounts

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/settings/:key` | Get specific setting value | Yes | - |
| GET | `/api/bank-accounts/default` | Get default bank account | No | - |

---

## Error Responses

All endpoints return standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions or phone verification required |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed message"
}
```

### Rate Limit Response (429)

```json
{
  "message": "Too many login attempts",
  "retryAfter": 300
}
```

---

## Security Features

### Login Token (CSRF Protection)
- One-time use token generated before login
- Expires after 6 minutes
- IP-address bound

### Rate Limiting
- Login: 5 attempts per 5 minutes per IP
- OTP: 60-second cooldown between requests

### Phone Verification
- Required for account activation
- OTP sent via WhatsApp
- 6-digit code, expires after 5 minutes

---

## Related Documentation

- [ADMIN_API_DOCUMENTATION.md](./ADMIN_API_DOCUMENTATION.md) - Admin endpoints
- [AUTHENTICATION_DOCUMENTATION.md](./AUTHENTICATION_DOCUMENTATION.md) - Auth flows
- [Pentest Documentation](../pentest/) - Security testing resources

---

## Changelog

### January 2025
- Added early settlement endpoints
- Added disbursement slip download
- Added stamp certificate download
- Enhanced KYC endpoints with CTOS integration
- Added login token security enhancement
