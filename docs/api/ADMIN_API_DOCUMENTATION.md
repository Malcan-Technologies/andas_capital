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

---

## 1. Admin Authentication

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/login-token` | Get one-time login token | Public |
| POST | `/api/admin/login` | Admin login | Public |
| POST | `/api/admin/refresh` | Refresh admin token | Public |
| POST | `/api/admin/logout` | Admin logout | Admin/Attestor |
| GET | `/api/admin/me` | Get current admin profile | Admin/Attestor |
| PUT | `/api/admin/me` | Update admin profile | Admin/Attestor |

### GET /api/admin/login-token

**Response:**
```json
{
  "loginToken": "a1b2c3d4e5f6...",
  "message": "Login token generated successfully"
}
```

### POST /api/admin/login

**Request:**
```json
{
  "phoneNumber": "60123456789",
  "password": "AdminSecurePass1!",
  "loginToken": "a1b2c3d4e5f6..."
}
```

**Response (2FA Required - 403):**
```json
{
  "message": "Please verify your phone number to complete admin login. We've sent a verification code to your WhatsApp.",
  "requiresPhoneVerification": true,
  "phoneNumber": "+60123456789",
  "userId": "uuid"
}
```

After OTP verification via `/api/auth/verify-otp`:

**Response (Success):**
```json
{
  "message": "Phone number verified successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "uuid",
  "phoneNumber": "+60123456789",
  "role": "ADMIN"
}
```

### POST /api/admin/refresh

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/admin/me

**Response:**
```json
{
  "id": "uuid",
  "phoneNumber": "+60123456789",
  "fullName": "Admin User",
  "email": "admin@company.com",
  "role": "ADMIN",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": "2025-01-21T10:30:00.000Z"
}
```

### PUT /api/admin/me

**Request:**
```json
{
  "fullName": "Admin User",
  "email": "admin@company.com"
}
```

**Response:** Same as GET /api/admin/me

---

## 2. Dashboard & Statistics

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Get dashboard statistics | Admin/Attestor |
| GET | `/api/admin/monthly-stats` | Get monthly statistics | Admin/Attestor |
| GET | `/api/admin/daily-stats` | Get daily statistics | Admin/Attestor |

### GET /api/admin/dashboard

**Response (ADMIN role):**
```json
{
  "totalUsers": 1250,
  "totalApplications": 450,
  "pendingReviewApplications": 25,
  "approvedLoans": 320,
  "pendingDisbursementCount": 15,
  "disbursedLoans": 280,
  "totalDisbursedAmount": 2500000.00,
  "totalLoanValue": 3500000.00,
  "currentLoanValue": 1800000.00,
  "totalFeesCollected": 125000.00,
  "totalLateFeesCollected": 15000.00,
  "totalRepayments": 1200000.00,
  "PENDING_SIGNATURE": 8,
  "LIVE_ATTESTATIONS": 3,
  "recentApplications": [
    {
      "id": "uuid",
      "userName": "John Doe",
      "amount": 10000,
      "status": "PENDING_APPROVAL",
      "createdAt": "2025-01-21T09:00:00.000Z"
    }
  ],
  "portfolioOverview": {
    "activeLoans": 250,
    "overdueLoans": 15,
    "defaultLoans": 5,
    "dischargedLoans": 50
  },
  "repaymentPerformance": {
    "onTimePayments": 95.5,
    "latePayments": 4.5,
    "totalCollected": 1200000.00
  }
}
```

**Response (ATTESTOR role - Limited data):**
```json
{
  "PENDING_SIGNATURE": 8,
  "LIVE_ATTESTATIONS": 3,
  "totalUsers": 0,
  "totalApplications": 0,
  "pendingReviewApplications": 0
}
```

---

## 3. User Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | Get all users | Admin/Attestor |
| GET | `/api/admin/users/:id` | Get specific user | Admin |
| POST | `/api/admin/users` | Create new user | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |

### GET /api/admin/users

**Response:**
```json
[
  {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+60123456789",
    "role": "USER",
    "createdAt": "2024-06-15T08:00:00.000Z",
    "lastLoginAt": "2025-01-20T10:30:00.000Z",
    "icNumber": "901234-14-5678",
    "icType": "MYKAD",
    "kycStatus": true,
    "isOnboardingComplete": true,
    "city": "Kuala Lumpur",
    "state": "Selangor"
  }
]
```

### POST /api/admin/users

**Request:**
```json
{
  "phoneNumber": "60198765432",
  "password": "SecurePass1!",
  "fullName": "New User",
  "email": "newuser@example.com",
  "role": "USER"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "fullName": "New User",
  "email": "newuser@example.com",
  "phoneNumber": "+60198765432",
  "role": "USER",
  "createdAt": "2025-01-21T10:30:00.000Z",
  "lastLoginAt": null
}
```

### GET /api/admin/users/:id

**Response:**
```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+60123456789",
  "role": "USER",
  "createdAt": "2024-06-15T08:00:00.000Z",
  "updatedAt": "2025-01-20T10:30:00.000Z",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "address1": "123 Main Street",
  "address2": "Unit 4A",
  "city": "Kuala Lumpur",
  "state": "Selangor",
  "zipCode": "50000",
  "country": "Malaysia",
  "employmentStatus": "EMPLOYED",
  "employerName": "ABC Company Sdn Bhd",
  "monthlyIncome": "5000",
  "serviceLength": "3",
  "occupation": "SOFTWARE_ENGINEER",
  "bankName": "Maybank",
  "accountNumber": "1234567890",
  "onboardingStep": 4,
  "isOnboardingComplete": true,
  "kycStatus": true,
  "lastLoginAt": "2025-01-20T10:30:00.000Z",
  "phoneVerified": true,
  "icNumber": "901234-14-5678",
  "icType": "MYKAD",
  "nationality": "Malaysian",
  "race": "MALAY",
  "gender": "MALE",
  "educationLevel": "DEGREE",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+60198765432",
  "emergencyContactRelationship": "SPOUSE"
}
```

### PUT /api/admin/users/:id

**Request:**
```json
{
  "fullName": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "ATTESTOR",
  "kycStatus": true
}
```

**Response:** Same as GET /api/admin/users/:id

---

## 4. Application Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/applications` | Get all applications | Admin/Attestor |
| GET | `/api/admin/applications/counts` | Get application counts | Admin/Attestor |
| GET | `/api/admin/applications/:id` | Get specific application | Admin/Attestor |
| PATCH | `/api/admin/applications/:id/status` | Update application status | Admin/Attestor |
| GET | `/api/admin/applications/:id/history` | Get application history | Admin/Attestor |
| POST | `/api/admin/applications/:id/fresh-offer` | Create fresh offer | Admin |
| POST | `/api/admin/applications/:id/disburse` | Disburse loan | Admin/Attestor |
| POST | `/api/admin/applications/:id/complete-attestation` | Complete attestation | Admin/Attestor |
| GET | `/api/admin/applications/live-attestations` | Get live attestations | Admin/Attestor |
| POST | `/api/admin/applications/:id/complete-live-attestation` | Complete live attestation | Admin/Attestor |

### GET /api/admin/applications

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by name/phone/IC

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "productId": "uuid",
      "requestedAmount": 10000,
      "approvedAmount": 10000,
      "amount": 10000,
      "term": 12,
      "interestRate": 12.0,
      "monthlyRepayment": 900.50,
      "netDisbursement": 9640,
      "status": "PENDING_APPROVAL",
      "currentStep": 5,
      "createdAt": "2025-01-21T09:00:00.000Z",
      "updatedAt": "2025-01-21T10:00:00.000Z",
      "user": {
        "id": "uuid",
        "fullName": "John Doe",
        "phoneNumber": "+60123456789",
        "email": "john@example.com",
        "icNumber": "901234-14-5678"
      },
      "product": {
        "id": "uuid",
        "name": "Personal Loan",
        "code": "PL001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/admin/applications/counts

**Response:**
```json
{
  "INCOMPLETE": 45,
  "PENDING_APP_FEE": 12,
  "PENDING_PROFILE_CONFIRMATION": 8,
  "PENDING_KYC": 15,
  "PENDING_APPROVAL": 25,
  "PENDING_FRESH_OFFER": 5,
  "PENDING_ATTESTATION": 10,
  "PENDING_SIGNATURE": 8,
  "PENDING_PKI_SIGNING": 3,
  "PENDING_SIGNING_COMPANY_WITNESS": 2,
  "PENDING_STAMPING": 4,
  "PENDING_DISBURSEMENT": 15,
  "ACTIVE": 280,
  "REJECTED": 20,
  "CANCELLED": 15,
  "total": 467
}
```

### GET /api/admin/applications/:id

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "requestedAmount": 10000,
  "approvedAmount": 10000,
  "amount": 10000,
  "term": 12,
  "interestRate": 12.0,
  "monthlyRepayment": 900.50,
  "totalAmount": 10806,
  "netDisbursement": 9640,
  "originationFee": 200,
  "legalFee": 100,
  "applicationFee": 50,
  "stampingFee": 10,
  "status": "PENDING_APPROVAL",
  "currentStep": 5,
  "kycStatus": true,
  "attestationType": null,
  "attestationCompleted": false,
  "createdAt": "2025-01-21T09:00:00.000Z",
  "updatedAt": "2025-01-21T10:00:00.000Z",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "phoneNumber": "+60123456789",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "employmentStatus": "EMPLOYED",
    "employerName": "ABC Company Sdn Bhd",
    "monthlyIncome": "5000",
    "bankName": "Maybank",
    "accountNumber": "1234567890",
    "address1": "123 Main Street",
    "city": "Kuala Lumpur",
    "state": "Selangor",
    "icNumber": "901234-14-5678"
  },
  "product": {
    "id": "uuid",
    "name": "Personal Loan",
    "code": "PL001",
    "interestRate": 12.0,
    "requiredDocuments": ["IC_FRONT", "IC_BACK", "PAYSLIP"]
  },
  "documents": [
    {
      "id": "uuid",
      "type": "IC_FRONT",
      "status": "APPROVED",
      "fileName": "ic_front.jpg",
      "uploadedAt": "2025-01-21T09:30:00.000Z"
    }
  ],
  "loan": null
}
```

### PATCH /api/admin/applications/:id/status

**Request:**
```json
{
  "status": "PENDING_ATTESTATION",
  "notes": "Application approved, proceeding to attestation",
  "approvedAmount": 10000,
  "approvedTerm": 12
}
```

**Response:** Same as GET /api/admin/applications/:id with updated status

### POST /api/admin/applications/:id/fresh-offer

**Request:**
```json
{
  "amount": 8000,
  "term": 12,
  "interestRate": 10.0,
  "monthlyRepayment": 720.50,
  "netDisbursement": 7680,
  "stampingFee": 10,
  "legalFeeFixed": 100,
  "notes": "Reduced amount based on income verification"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "PENDING_FRESH_OFFER",
  "freshOfferAmount": 8000,
  "freshOfferTerm": 12,
  "freshOfferInterestRate": 10.0,
  "freshOfferMonthlyRepayment": 720.50,
  "freshOfferNetDisbursement": 7680,
  "freshOfferNotes": "Reduced amount based on income verification",
  "freshOfferSubmittedAt": "2025-01-21T11:00:00.000Z",
  "originalOfferAmount": 10000,
  "originalOfferTerm": 12
}
```

### POST /api/admin/applications/:id/complete-live-attestation

**Request:**
```json
{
  "notes": "Video call completed successfully. Borrower confirmed all terms.",
  "meetingCompletedAt": "2025-01-21T10:30:00.000Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "CERT_CHECK",
  "attestationCompleted": true,
  "attestationDate": "2025-01-21T10:30:00.000Z",
  "attestationNotes": "Video call completed successfully. Borrower confirmed all terms.",
  "attestationType": "MEETING"
}
```

### POST /api/admin/applications/:id/disburse

**Request:**
```json
{
  "disbursementDate": "2025-01-21",
  "referenceNumber": "DIS20250121001",
  "notes": "Disbursed via bank transfer"
}
```

**Response:**
```json
{
  "message": "Loan disbursed successfully",
  "applicationId": "uuid",
  "loanId": "uuid",
  "disbursement": {
    "referenceNumber": "DIS20250121001",
    "amount": 9640,
    "disbursedAt": "2025-01-21T10:00:00.000Z"
  }
}
```

---

## 5. Loan Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/loans` | Get all loans | Admin/Attestor |
| GET | `/api/admin/loans/:id` | Get specific loan | Admin/Attestor |
| GET | `/api/admin/loans/:id/repayments` | Get loan repayments | Admin/Attestor |
| GET | `/api/admin/loans/pending-discharge` | Get loans pending discharge | Admin/Attestor |
| POST | `/api/admin/loans/:id/request-discharge` | Request loan discharge | Admin/Attestor |
| POST | `/api/admin/loans/:id/approve-discharge` | Approve loan discharge | Admin/Attestor |
| GET | `/api/admin/loans/:loanId/download-agreement` | Download loan agreement | Admin/Attestor |
| GET | `/api/admin/loans/:loanId/download-stamped-agreement` | Download stamped agreement | Admin/Attestor |
| POST | `/api/admin/loans/:id/upload-stamped-agreement` | Upload stamped agreement | Admin/Attestor |
| POST | `/api/admin/loans/:id/upload-stamp-certificate` | Upload stamp certificate | Admin/Attestor |

### GET /api/admin/loans

**Query Parameters:**
- `status` - Filter by status (ACTIVE, OVERDUE, DEFAULT, DISCHARGED)
- `page` - Page number
- `limit` - Items per page
- `search` - Search by borrower name/phone/IC

**Response:**
```json
{
  "loans": [
    {
      "id": "uuid",
      "userId": "uuid",
      "applicationId": "uuid",
      "principalAmount": 10000,
      "totalAmount": 10806,
      "outstandingBalance": 5403,
      "monthlyPayment": 900.50,
      "interestRate": 12.0,
      "repaymentTerm": 12,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "nextPaymentDue": "2025-02-01T00:00:00.000Z",
      "status": "ACTIVE",
      "user": {
        "id": "uuid",
        "fullName": "John Doe",
        "phoneNumber": "+60123456789"
      },
      "application": {
        "product": {
          "name": "Personal Loan",
          "code": "PL001"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 280
  }
}
```

### GET /api/admin/loans/:id

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "applicationId": "uuid",
  "principalAmount": 10000,
  "totalAmount": 10806,
  "outstandingBalance": 5403,
  "principalPaid": 4597,
  "interestPaid": 0,
  "monthlyPayment": 900.50,
  "interestRate": 12.0,
  "repaymentTerm": 12,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T00:00:00.000Z",
  "nextPaymentDue": "2025-02-01T00:00:00.000Z",
  "status": "ACTIVE",
  "signedAgreementUrl": "https://...",
  "stampedAgreementUrl": "https://...",
  "stampCertificateUrl": "https://...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "phoneNumber": "+60123456789",
    "email": "john@example.com",
    "bankName": "Maybank",
    "accountNumber": "1234567890"
  },
  "application": {
    "id": "uuid",
    "product": {
      "name": "Personal Loan",
      "code": "PL001"
    },
    "disbursement": {
      "referenceNumber": "DIS20250101001",
      "amount": 9640,
      "disbursedAt": "2025-01-01T10:00:00.000Z"
    }
  },
  "repayments": [
    {
      "id": "uuid",
      "dueDate": "2025-02-01T00:00:00.000Z",
      "amount": 900.50,
      "status": "PENDING",
      "principalPaid": 0,
      "lateFeeAmount": 0
    }
  ],
  "lateFee": {
    "gracePeriodDays": 3,
    "totalAccruedFees": 0,
    "status": "NONE"
  }
}
```

### POST /api/admin/loans/:id/upload-stamped-agreement

**Request:** `multipart/form-data`
- `file` - PDF file

**Response:**
```json
{
  "message": "Stamped agreement uploaded successfully",
  "loanId": "uuid",
  "stampedAgreementUrl": "https://..."
}
```

---

## 6. Repayment & Payment Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/repayments/pending` | Get pending repayments | Admin/Attestor |
| POST | `/api/admin/repayments/:id/approve` | Approve repayment | Admin/Attestor |
| POST | `/api/admin/repayments/:id/reject` | Reject repayment | Admin/Attestor |
| POST | `/api/admin/payments/manual` | Create manual payment | Admin/Attestor |
| POST | `/api/admin/payments/csv-upload` | Upload payment CSV | Admin/Attestor |
| GET | `/api/admin/payments/pending` | Get pending payments | Admin/Attestor |
| POST | `/api/admin/payments/:id/approve` | Approve payment | Admin/Attestor |

### GET /api/admin/repayments/pending

**Response:**
```json
{
  "repayments": [
    {
      "id": "uuid",
      "loanId": "uuid",
      "dueDate": "2025-02-01T00:00:00.000Z",
      "amount": 900.50,
      "status": "PENDING",
      "principalPaid": 0,
      "lateFeeAmount": 0,
      "loan": {
        "id": "uuid",
        "user": {
          "fullName": "John Doe",
          "phoneNumber": "+60123456789"
        }
      }
    }
  ]
}
```

### POST /api/admin/repayments/:id/approve

**Request:**
```json
{
  "amount": 900.50,
  "paymentDate": "2025-01-21",
  "paymentReference": "TRF123456",
  "notes": "Bank transfer confirmed"
}
```

**Response:**
```json
{
  "message": "Repayment approved successfully",
  "repaymentId": "uuid",
  "receiptId": "uuid",
  "receiptNumber": "RCP20250121001"
}
```

### POST /api/admin/payments/manual

**Request:**
```json
{
  "loanId": "uuid",
  "repaymentId": "uuid",
  "amount": 900.50,
  "paymentDate": "2025-01-21",
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "TRF123456",
  "notes": "Manual payment recorded"
}
```

**Response:**
```json
{
  "message": "Manual payment recorded successfully",
  "transactionId": "uuid",
  "receiptId": "uuid"
}
```

### POST /api/admin/payments/csv-upload

**Request:** `multipart/form-data`
- `file` - CSV file with columns: `loanId`, `amount`, `paymentDate`, `reference`

**Response:**
```json
{
  "message": "CSV processed successfully",
  "processed": 25,
  "failed": 2,
  "errors": [
    {
      "row": 10,
      "error": "Loan not found"
    }
  ]
}
```

---

## 7. Late Fee Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/late-fees` | Get all late fees | Admin/Attestor |
| GET | `/api/admin/late-fees/status` | Get late fee processing status | Admin/Attestor |
| POST | `/api/admin/late-fees/process` | Process late fees | Admin |
| GET | `/api/admin/late-fees/repayment/:repaymentId` | Get repayment late fees | Admin/Attestor |
| POST | `/api/admin/late-fees/repayment/:repaymentId/waive` | Waive late fees | Admin |

### GET /api/admin/late-fees/repayment/:repaymentId

**Response:**
```json
{
  "repaymentId": "uuid",
  "scheduledAmount": 900.50,
  "principalPaid": 0,
  "outstandingAmount": 900.50,
  "lateFeeAmount": 50.00,
  "lateFeesPaid": 0,
  "totalDue": 950.50,
  "daysOverdue": 15,
  "dueDate": "2025-01-01T00:00:00.000Z"
}
```

### POST /api/admin/late-fees/repayment/:repaymentId/waive

**Request:**
```json
{
  "amount": 50.00,
  "reason": "Customer hardship - approved by management"
}
```

**Response:**
```json
{
  "message": "Late fees waived successfully",
  "waivedAmount": 50.00,
  "remainingLateFees": 0
}
```

---

## 8. Early Settlement

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/early-settlement/pending` | Get pending early settlements | Admin/Attestor |
| GET | `/api/admin/early-settlement/:transactionId` | Get specific early settlement | Admin/Attestor |
| POST | `/api/admin/early-settlement/:transactionId/approve` | Approve early settlement | Admin/Attestor |
| POST | `/api/admin/early-settlement/:transactionId/reject` | Reject early settlement | Admin/Attestor |

### GET /api/admin/early-settlement/pending

**Response:**
```json
{
  "settlements": [
    {
      "id": "uuid",
      "loanId": "uuid",
      "settlementAmount": 5050.00,
      "outstandingPrincipal": 5000.00,
      "accruedInterest": 50.00,
      "unpaidLateFees": 0,
      "status": "PENDING",
      "requestedAt": "2025-01-21T09:00:00.000Z",
      "loan": {
        "user": {
          "fullName": "John Doe",
          "phoneNumber": "+60123456789"
        }
      }
    }
  ]
}
```

### POST /api/admin/early-settlement/:transactionId/approve

**Request:**
```json
{
  "paymentReference": "TRF123456",
  "notes": "Payment verified",
  "interestDiscount": 25.00
}
```

**Response:**
```json
{
  "message": "Early settlement approved",
  "loanId": "uuid",
  "newStatus": "PENDING_DISCHARGE",
  "settledAmount": 5025.00
}
```

---

## 9. Disbursement Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/disbursements` | Get all disbursements | Admin/Attestor |
| GET | `/api/admin/disbursements/:applicationId/payment-slip` | Download payment slip | Admin/Attestor |

### GET /api/admin/disbursements

**Response:**
```json
{
  "disbursements": [
    {
      "id": "uuid",
      "applicationId": "uuid",
      "amount": 9640,
      "referenceNumber": "DIS20250121001",
      "disbursedAt": "2025-01-21T10:00:00.000Z",
      "status": "COMPLETED",
      "application": {
        "user": {
          "fullName": "John Doe",
          "bankName": "Maybank",
          "accountNumber": "1234567890"
        }
      }
    }
  ]
}
```

---

## 10. Document Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| PATCH | `/api/admin/documents/:id/status` | Update document status | Admin/Attestor |

### PATCH /api/admin/documents/:id/status

**Request:**
```json
{
  "status": "APPROVED",
  "notes": "Document verified"
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "IC_FRONT",
  "status": "APPROVED",
  "updatedAt": "2025-01-21T10:30:00.000Z"
}
```

---

## 11. Notification Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/notification-templates` | Get notification templates | Admin/Attestor |
| POST | `/api/admin/notification-templates` | Create notification template | Admin |
| PUT | `/api/admin/notification-templates/:id` | Update notification template | Admin |
| DELETE | `/api/admin/notification-templates/:id` | Delete notification template | Admin |
| POST | `/api/admin/send-notification` | Send notification | Admin/Attestor |

### POST /api/admin/send-notification

**Request:**
```json
{
  "userId": "uuid",
  "title": "Payment Reminder",
  "message": "Your payment of RM900.50 is due tomorrow",
  "type": "PAYMENT_REMINDER",
  "sendWhatsApp": true
}
```

**Response:**
```json
{
  "message": "Notification sent successfully",
  "notificationId": "uuid",
  "whatsAppSent": true
}
```

---

## 12. Settings & Configuration

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/settings` | Get all settings | Admin |
| PUT | `/api/admin/settings` | Update settings | Admin |
| GET | `/api/admin/bank-accounts` | Get all bank accounts | Admin |
| POST | `/api/admin/bank-accounts` | Create bank account | Admin |
| PUT | `/api/admin/bank-accounts/:id` | Update bank account | Admin |
| POST | `/api/admin/bank-accounts/:id/set-default` | Set as default account | Admin |

### GET /api/admin/settings

**Response:**
```json
{
  "settings": [
    {
      "key": "ENABLE_WHATSAPP_NOTIFICATIONS",
      "value": true,
      "category": "NOTIFICATIONS"
    },
    {
      "key": "LATE_FEE_GRACE_DAYS",
      "value": 3,
      "category": "LATE_FEES"
    },
    {
      "key": "ENABLE_LATE_FEE_GRACE_PERIOD",
      "value": true,
      "category": "LATE_FEES"
    }
  ]
}
```

### PUT /api/admin/settings

**Request:**
```json
{
  "settings": [
    {
      "key": "LATE_FEE_GRACE_DAYS",
      "value": 5
    }
  ]
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "updated": 1
}
```

### POST /api/admin/bank-accounts

**Request:**
```json
{
  "bankName": "CIMB",
  "accountName": "Company Name Sdn Bhd",
  "accountNumber": "1234567890",
  "swiftCode": "CIABORBBXXX",
  "isDefault": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "bankName": "CIMB",
  "accountName": "Company Name Sdn Bhd",
  "accountNumber": "1234567890",
  "swiftCode": "CIABORBBXXX",
  "isDefault": false,
  "createdAt": "2025-01-21T10:30:00.000Z"
}
```

---

## 13. Internal Signers

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/internal-signers` | Get all internal signers | Admin/Attestor |
| GET | `/api/admin/internal-signers/lookup/:icNumber` | Lookup signer by IC | Admin/Attestor |
| POST | `/api/admin/internal-signers` | Create internal signer | Admin/Attestor |
| POST | `/api/admin/internal-signers/:id/verify-pin` | Verify signer PIN | Admin/Attestor |
| PUT | `/api/admin/internal-signers/:id` | Update internal signer | Admin/Attestor |
| DELETE | `/api/admin/internal-signers/:id` | Delete internal signer | Admin |

### GET /api/admin/internal-signers

**Response:**
```json
{
  "signers": [
    {
      "id": "uuid",
      "name": "Company Representative",
      "icNumber": "800101-14-5678",
      "email": "rep@company.com",
      "phoneNumber": "+60123456789",
      "role": "COMPANY",
      "hasCertificate": true,
      "certificateExpiry": "2026-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/admin/internal-signers/:id/verify-pin

**Request:**
```json
{
  "pin": "123456"
}
```

**Response:**
```json
{
  "valid": true,
  "signerId": "uuid"
}
```

---

## 14. Admin KYC Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/kyc/status` | Get KYC overview status | Admin/Attestor |
| GET | `/api/admin/kyc/:kycId/status` | Get specific KYC status | Admin/Attestor |
| POST | `/api/admin/kyc/start-ctos` | Start CTOS for user | Admin/Attestor |
| GET | `/api/admin/kyc/admin-ctos-status` | Get admin CTOS status | Admin/Attestor |
| GET | `/api/admin/kyc/images` | Get KYC images | Admin/Attestor |

### GET /api/admin/kyc/status

**Query Parameters:**
- `userId` - Filter by user ID

**Response:**
```json
{
  "userId": "uuid",
  "kycStatus": true,
  "ctosStatus": "VERIFIED",
  "lastVerifiedAt": "2025-01-15T10:00:00.000Z",
  "documents": [
    {
      "type": "IC_FRONT",
      "status": "VERIFIED",
      "verifiedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 15. Admin MTSA/PKI Management

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/mtsa/cert-info/:userId` | Get user certificate info | Admin/Attestor |
| POST | `/api/admin/mtsa/verify-cert-pin` | Verify certificate PIN | Admin/Attestor |
| POST | `/api/admin/mtsa/reset-cert-pin` | Reset certificate PIN | Admin/Attestor |
| POST | `/api/admin/mtsa/request-otp` | Request signing OTP | Admin/Attestor |
| POST | `/api/admin/mtsa/request-certificate` | Request new certificate | Admin/Attestor |
| POST | `/api/admin/mtsa/revoke-certificate` | Revoke user certificate | Admin |

### GET /api/admin/mtsa/cert-info/:userId

**Response:**
```json
{
  "userId": "uuid",
  "hasCertificate": true,
  "certificateStatus": "ACTIVE",
  "serialNumber": "ABC123456",
  "issuedAt": "2025-01-01T00:00:00.000Z",
  "expiresAt": "2026-01-01T00:00:00.000Z",
  "issuer": "MyTrustCA"
}
```

### POST /api/admin/mtsa/request-certificate

**Request:**
```json
{
  "userId": "uuid",
  "icNumber": "901234-14-5678",
  "fullName": "John Doe",
  "phoneNumber": "+60123456789"
}
```

**Response:**
```json
{
  "message": "Certificate request submitted",
  "requestId": "uuid",
  "status": "PENDING"
}
```

---

## 16. Cron Jobs & System Tasks

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/cron/status` | Get cron job status | Admin/Attestor |
| POST | `/api/admin/cron/trigger-late-fee-processing` | Trigger late fee processing | Admin/Attestor |
| POST | `/api/admin/cron/trigger-default-processing` | Trigger default processing | Admin/Attestor |
| POST | `/api/admin/cron/trigger-payment-notifications` | Trigger payment notifications | Admin/Attestor |

### GET /api/admin/cron/status

**Response:**
```json
{
  "lateFeeProcessing": {
    "lastRun": "2025-01-21T00:00:00.000Z",
    "nextRun": "2025-01-22T00:00:00.000Z",
    "status": "IDLE"
  },
  "paymentNotifications": {
    "lastRun": "2025-01-21T08:00:00.000Z",
    "nextRun": "2025-01-21T09:00:00.000Z",
    "status": "IDLE"
  },
  "defaultProcessing": {
    "lastRun": "2025-01-21T00:00:00.000Z",
    "nextRun": "2025-01-22T00:00:00.000Z",
    "status": "IDLE"
  }
}
```

### POST /api/admin/cron/trigger-late-fee-processing

**Response:**
```json
{
  "message": "Late fee processing triggered",
  "processed": 15,
  "newLateFees": 5,
  "totalAmount": 250.00
}
```

---

## 17. PDF Letters & Reports

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/:loanId/pdf-letters` | Get PDF letters for loan | Admin |
| POST | `/api/admin/:loanId/generate-pdf-letter` | Generate PDF letter | Admin |
| GET | `/api/admin/:loanId/pdf-letters/:filename/download` | Download PDF letter | Admin |
| GET | `/api/admin/:loanId/lampiran-a` | Get Lampiran A document | Admin |

### POST /api/admin/:loanId/generate-pdf-letter

**Request:**
```json
{
  "letterType": "REMINDER_1",
  "language": "MALAY"
}
```

**Response:**
```json
{
  "message": "PDF letter generated",
  "filename": "reminder_1_20250121.pdf",
  "downloadUrl": "/api/admin/uuid/pdf-letters/reminder_1_20250121.pdf/download"
}
```

### Letter Types

| Type | Description |
|------|-------------|
| `REMINDER_1` | First payment reminder |
| `REMINDER_2` | Second payment reminder |
| `REMINDER_3` | Final payment reminder |
| `NOTICE_OF_DEFAULT` | Default notice |
| `DEMAND_LETTER` | Legal demand letter |

---

## 18. Access & Document Logs

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/admin/access-logs` | Get admin access logs | Admin |
| GET | `/api/admin/access-logs/export` | Export access logs | Admin |
| GET | `/api/admin/document-logs` | Get document logs | Admin |
| POST | `/api/admin/document-logs/scan` | Scan for documents | Admin |
| GET | `/api/admin/document-logs/export` | Export document logs | Admin |

### GET /api/admin/access-logs

**Query Parameters:**
- `startDate` - Filter from date
- `endDate` - Filter to date
- `userId` - Filter by user ID

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Admin User",
      "phoneNumber": "+60123456789",
      "role": "ADMIN",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "loginAt": "2025-01-21T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250
  }
}
```

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
  "error": "Error description",
  "message": "Detailed message"
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
- Added comprehensive request/response examples
