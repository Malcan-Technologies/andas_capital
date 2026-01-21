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

### GET /api/auth/login-token

**Response:**
```json
{
  "loginToken": "a1b2c3d4e5f6...",
  "message": "Login token generated successfully"
}
```

### POST /api/auth/login

**Request:**
```json
{
  "phoneNumber": "60123456789",
  "password": "SecurePass1!",
  "loginToken": "a1b2c3d4e5f6..."
}
```

**Response (Success):**
```json
{
  "userId": "uuid",
  "phoneNumber": "+60123456789",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "isOnboardingComplete": true,
  "onboardingStep": 4,
  "message": "Login successful"
}
```

**Response (Phone Verification Required - 403):**
```json
{
  "message": "Please verify your phone number before logging in.",
  "requiresPhoneVerification": true,
  "phoneNumber": "+60123456789",
  "userId": "uuid"
}
```

### POST /api/auth/signup

**Request:**
```json
{
  "phoneNumber": "60123456789",
  "password": "SecurePass1!"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully. Please verify your phone number with the OTP sent via WhatsApp.",
  "userId": "uuid",
  "phoneNumber": "+60123456789",
  "otpSent": true,
  "expiresAt": "2025-01-21T10:35:00.000Z"
}
```

### POST /api/auth/verify-otp

**Request:**
```json
{
  "phoneNumber": "60123456789",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Phone number verified successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "uuid",
  "phoneNumber": "+60123456789",
  "isOnboardingComplete": false,
  "onboardingStep": 1,
  "role": "USER"
}
```

### POST /api/auth/resend-otp

**Request:**
```json
{
  "phoneNumber": "60123456789"
}
```

**Response:**
```json
{
  "message": "Verification code sent successfully via WhatsApp",
  "otpSent": true,
  "expiresAt": "2025-01-21T10:35:00.000Z"
}
```

### POST /api/auth/refresh

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
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "isOnboardingComplete": true,
  "onboardingStep": 4
}
```

### POST /api/auth/logout

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### POST /api/auth/forgot-password

**Request:**
```json
{
  "phoneNumber": "60123456789"
}
```

**Response:**
```json
{
  "message": "If this phone number is registered, you will receive a password reset code via WhatsApp"
}
```

### POST /api/auth/verify-reset-otp

**Request:**
```json
{
  "phoneNumber": "60123456789",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "resetToken": "a1b2c3d4e5f6...",
  "userId": "uuid"
}
```

### POST /api/auth/reset-password

**Request:**
```json
{
  "resetToken": "a1b2c3d4e5f6...",
  "newPassword": "NewSecurePass1!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 special character
- No spaces allowed

### Phone Number Format
- E.164 format WITHOUT `+` symbol for input
- Example: `60123456789` (Malaysia)
- Stored and returned WITH `+` prefix: `+60123456789`

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

### GET /api/users/me

**Response:**
```json
{
  "id": "uuid",
  "phoneNumber": "+60123456789",
  "fullName": "John Doe",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "address1": "123 Main Street",
  "address2": "Unit 4A",
  "city": "Kuala Lumpur",
  "state": "Selangor",
  "zipCode": "50000",
  "employmentStatus": "EMPLOYED",
  "employerName": "ABC Company Sdn Bhd",
  "monthlyIncome": "5000",
  "serviceLength": "3",
  "bankName": "Maybank",
  "accountNumber": "1234567890",
  "isOnboardingComplete": true,
  "onboardingStep": 4,
  "kycStatus": true,
  "lastLoginAt": "2025-01-20T10:30:00.000Z",
  "createdAt": "2024-06-15T08:00:00.000Z",
  "updatedAt": "2025-01-20T10:30:00.000Z",
  "role": "USER",
  "icNumber": "901234-14-5678",
  "icType": "MYKAD",
  "educationLevel": "DEGREE",
  "race": "MALAY",
  "gender": "MALE",
  "occupation": "SOFTWARE_ENGINEER",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+60198765432",
  "emergencyContactRelationship": "SPOUSE"
}
```

### PUT /api/users/me

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-15",
  "address1": "123 Main Street",
  "address2": "Unit 4A",
  "city": "Kuala Lumpur",
  "state": "Selangor",
  "zipCode": "50000",
  "employmentStatus": "EMPLOYED",
  "employerName": "ABC Company Sdn Bhd",
  "monthlyIncome": "5000",
  "serviceLength": "3",
  "bankName": "Maybank",
  "accountNumber": "1234567890",
  "icNumber": "901234-14-5678",
  "icType": "MYKAD",
  "educationLevel": "DEGREE",
  "race": "MALAY",
  "gender": "MALE",
  "occupation": "SOFTWARE_ENGINEER",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+60198765432",
  "emergencyContactRelationship": "SPOUSE"
}
```

**Response:** Same as GET /api/users/me

### PUT /api/users/me/password

**Request:**
```json
{
  "currentPassword": "OldSecurePass1!",
  "newPassword": "NewSecurePass1!"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### POST /api/users/me/phone/change-request

**Request:**
```json
{
  "newPhoneNumber": "60198765432"
}
```

**Response:**
```json
{
  "message": "OTP sent to current phone number for verification",
  "expiresAt": "2025-01-21T10:35:00.000Z"
}
```

---

## 3. Onboarding

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/onboarding` | Get current onboarding step/status | Yes | `frontend/app/api/onboarding/route.ts` |
| POST | `/api/onboarding` | Submit onboarding data | Yes | `frontend/app/api/onboarding/route.ts` |

### GET /api/onboarding

**Response:**
```json
{
  "id": "uuid",
  "phoneNumber": "+60123456789",
  "onboardingStep": 2,
  "isOnboardingComplete": false,
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "email": "john@example.com",
  "address1": "123 Main Street",
  "address2": null,
  "city": "Kuala Lumpur",
  "state": "Selangor",
  "postalCode": "50000",
  "employmentStatus": null,
  "employerName": null,
  "monthlyIncome": null,
  "serviceLength": null,
  "bankName": null,
  "accountNumber": null,
  "icNumber": "901234-14-5678",
  "icType": "MYKAD",
  "educationLevel": "DEGREE",
  "race": "MALAY",
  "gender": "MALE",
  "occupation": null,
  "emergencyContactName": null,
  "emergencyContactPhone": null,
  "emergencyContactRelationship": null
}
```

### POST /api/onboarding

**Request (Step 1 - Personal Info):**
```json
{
  "onboardingStep": 1,
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "email": "john@example.com",
  "icNumber": "901234-14-5678",
  "icType": "MYKAD",
  "educationLevel": "DEGREE",
  "race": "MALAY",
  "gender": "MALE",
  "address1": "123 Main Street",
  "address2": "Unit 4A",
  "city": "Kuala Lumpur",
  "state": "Selangor",
  "postalCode": "50000"
}
```

**Request (Step 2 - Employment Info):**
```json
{
  "onboardingStep": 2,
  "employmentStatus": "EMPLOYED",
  "employerName": "ABC Company Sdn Bhd",
  "monthlyIncome": "5000",
  "serviceLength": "3",
  "occupation": "SOFTWARE_ENGINEER"
}
```

**Request (Step 3 - Emergency Contact & Bank):**
```json
{
  "onboardingStep": 3,
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+60198765432",
  "emergencyContactRelationship": "SPOUSE",
  "bankName": "Maybank",
  "accountNumber": "1234567890"
}
```

**Response:** Same as GET /api/onboarding with updated values

### Onboarding Steps
1. Personal Information
2. Employment Information
3. Emergency Contact & Bank Information
4. Complete

### Field Options

**icType:**
- `MYKAD` - Malaysian IC
- `PASSPORT` - Passport

**educationLevel:**
- `SPM`, `STPM`, `DIPLOMA`, `DEGREE`, `MASTERS`, `PHD`, `OTHERS`

**race:**
- `MALAY`, `CHINESE`, `INDIAN`, `OTHERS`

**gender:**
- `MALE`, `FEMALE`

**employmentStatus:**
- `EMPLOYED`, `SELF_EMPLOYED`, `UNEMPLOYED`, `RETIRED`, `STUDENT`

**emergencyContactRelationship:**
- `SPOUSE`, `PARENT`, `SIBLING`, `CHILD`, `FRIEND`, `OTHERS`

---

## 4. Products

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/products` | Get all active loan products | No | `frontend/app/api/products/route.ts` |
| GET | `/api/products/:id` | Get specific product by ID | No | `frontend/app/api/products/[id]/route.ts` |

### GET /api/products

**Response:**
```json
[
  {
    "id": "uuid",
    "code": "PL001",
    "name": "Personal Loan",
    "description": "Flexible personal loan for various needs",
    "minAmount": 1000,
    "maxAmount": 50000,
    "repaymentTerms": [3, 6, 12, 24, 36],
    "interestRate": 12.0,
    "eligibility": ["Malaysian citizen", "Age 21-60", "Minimum income RM2000"],
    "lateFeeRate": 1.0,
    "lateFeeFixedAmount": 50,
    "lateFeeFrequencyDays": 7,
    "originationFee": 2.0,
    "legalFee": 1.0,
    "applicationFee": 50,
    "stampingFee": 10,
    "legalFeeFixed": 100,
    "legalFeeType": "PERCENTAGE",
    "legalFeeValue": 1.0,
    "requiredDocuments": ["IC_FRONT", "IC_BACK", "PAYSLIP", "BANK_STATEMENT"],
    "features": ["Fast approval", "No collateral required"],
    "loanTypes": ["PERSONAL"],
    "isActive": true,
    "collateralRequired": false
  }
]
```

### GET /api/products/:id

**Response:** Single product object (same structure as above)

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
| PATCH | `/api/loan-applications/:id/step` | Update application step | Yes | - |
| POST | `/api/loan-applications/:id/documents` | Upload documents | Yes | - |
| GET | `/api/loan-applications/:id/documents` | Get application documents | Yes | - |
| GET | `/api/loan-applications/:id/history` | Get application history | Yes | - |
| POST | `/api/loan-applications/:id/fresh-offer-response` | Respond to fresh offer | Yes | - |

### POST /api/loan-applications

**Request:**
```json
{
  "productId": "uuid",
  "requestedAmount": 10000,
  "repaymentTerm": 12,
  "loanPurpose": "Home renovation"
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "requestedAmount": 10000,
  "repaymentTerm": 12,
  "loanPurpose": "Home renovation",
  "status": "INCOMPLETE",
  "currentStep": 1,
  "createdAt": "2025-01-21T10:30:00.000Z",
  "updatedAt": "2025-01-21T10:30:00.000Z"
}
```

### GET /api/loan-applications/:id

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "requestedAmount": 10000,
  "approvedAmount": 10000,
  "repaymentTerm": 12,
  "loanPurpose": "Home renovation",
  "status": "PENDING_APPROVAL",
  "currentStep": 5,
  "monthlyPayment": 900.50,
  "interestRate": 12.0,
  "totalAmount": 10806,
  "originationFee": 200,
  "legalFee": 100,
  "applicationFee": 50,
  "stampingFee": 10,
  "kycStatus": true,
  "createdAt": "2025-01-21T10:30:00.000Z",
  "updatedAt": "2025-01-21T12:00:00.000Z",
  "product": {
    "id": "uuid",
    "code": "PL001",
    "name": "Personal Loan"
  },
  "documents": [
    {
      "id": "uuid",
      "type": "IC_FRONT",
      "fileName": "ic_front.jpg",
      "status": "APPROVED"
    }
  ]
}
```

### POST /api/loan-applications/:id/fresh-offer-response

**Request:**
```json
{
  "accepted": true
}
```

**Response:**
```json
{
  "message": "Offer accepted successfully",
  "status": "PENDING_ATTESTATION"
}
```

### Application Statuses

| Status | Description |
|--------|-------------|
| `INCOMPLETE` | Application started but not complete |
| `PENDING_APP_FEE` | Waiting for application fee |
| `PENDING_PROFILE_CONFIRMATION` | Profile needs confirmation |
| `PENDING_KYC` | KYC verification pending |
| `PENDING_APPROVAL` | Under review |
| `PENDING_FRESH_OFFER` | Fresh offer pending user response |
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
| GET | `/api/loans/:id/repayments` | Get repayment schedule | Yes | - |
| GET | `/api/loans/:id/transactions` | Get loan transactions | Yes | - |
| GET | `/api/loans/:id/late-fees` | Get late fee information | Yes | - |
| POST | `/api/loans/:id/early-settlement/quote` | Get early settlement quote | Yes | - |
| POST | `/api/loans/:id/early-settlement/request` | Request early settlement | Yes | - |
| GET | `/api/loans/:loanId/download-agreement` | Download signed agreement | Yes | - |
| GET | `/api/loans/:loanId/download-stamped-agreement` | Download stamped agreement | Yes | - |
| GET | `/api/loans/:loanId/download-stamp-certificate` | Download stamp certificate | Yes | - |
| GET | `/api/loans/:loanId/download-disbursement-slip` | Download disbursement slip | Yes | - |

### GET /api/loans

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
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
    "progressPercentage": 50.0,
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
        "lateFeeAmount": 0
      }
    ],
    "overdueInfo": {
      "hasOverduePayments": false,
      "totalOverdueAmount": 0,
      "totalLateFees": 0
    }
  }
]
```

### POST /api/loans/:id/early-settlement/quote

**Response:**
```json
{
  "loanId": "uuid",
  "outstandingPrincipal": 5000,
  "accruedInterest": 50,
  "unpaidLateFees": 0,
  "settlementAmount": 5050,
  "validUntil": "2025-01-22T10:30:00.000Z",
  "savings": 200
}
```

### POST /api/loans/:id/early-settlement/request

**Request:**
```json
{
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "REF123456"
}
```

**Response:**
```json
{
  "message": "Early settlement request submitted",
  "transactionId": "uuid",
  "settlementAmount": 5050,
  "status": "PENDING_APPROVAL"
}
```

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

### GET /api/wallet

**Response:**
```json
{
  "balance": 1500.00,
  "availableForWithdrawal": 1500.00,
  "totalDeposits": 5000.00,
  "totalWithdrawals": 1000.00,
  "totalDisbursed": 9640.00,
  "pendingTransactions": 0,
  "bankConnected": true,
  "bankName": "Maybank",
  "accountNumber": "1234567890",
  "loanSummary": {
    "totalOutstanding": 5403.00,
    "totalBorrowed": 10806.00,
    "totalRepaid": 5403.00,
    "nextPaymentDue": "2025-02-01T00:00:00.000Z",
    "nextPaymentAmount": 900.50
  }
}
```

### GET /api/wallet/transactions

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "DEPOSIT",
      "amount": 1000.00,
      "status": "APPROVED",
      "reference": "DEP20250121001",
      "description": "Bank transfer deposit",
      "createdAt": "2025-01-21T10:30:00.000Z"
    },
    {
      "id": "uuid",
      "type": "LOAN_REPAYMENT",
      "amount": -900.50,
      "status": "APPROVED",
      "reference": "REP20250121001",
      "loanId": "uuid",
      "description": "Monthly payment - Personal Loan",
      "createdAt": "2025-01-21T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### POST /api/wallet/deposit

**Request:**
```json
{
  "amount": 1000.00,
  "paymentMethod": "BANK_TRANSFER",
  "reference": "TRF123456"
}
```

**Response:**
```json
{
  "message": "Deposit request submitted",
  "transactionId": "uuid",
  "amount": 1000.00,
  "status": "PENDING"
}
```

### POST /api/wallet/repay-loan

**Request:**
```json
{
  "loanId": "uuid",
  "amount": 900.50,
  "repaymentId": "uuid"
}
```

**Response:**
```json
{
  "message": "Loan repayment submitted",
  "transactionId": "uuid",
  "amount": 900.50,
  "status": "PENDING"
}
```

### Transaction Types

| Type | Description |
|------|-------------|
| `DEPOSIT` | Deposit to wallet |
| `WITHDRAWAL` | Withdrawal from wallet |
| `LOAN_REPAYMENT` | Loan repayment |
| `LOAN_DISBURSEMENT` | Loan disbursement |
| `EARLY_SETTLEMENT` | Early settlement payment |

---

## 8. Notifications

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| GET | `/api/notifications` | Get user notifications | Yes | `frontend/app/api/notifications/route.ts` |
| PATCH | `/api/notifications` | Mark notifications as read | Yes | `frontend/app/api/notifications/route.ts` |
| DELETE | `/api/notifications/:id` | Delete notification | Yes | `frontend/app/api/notifications/[id]/route.ts` |

### GET /api/notifications

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "PAYMENT_REMINDER",
      "title": "Payment Due Tomorrow",
      "message": "Your monthly payment of RM900.50 is due tomorrow",
      "isRead": false,
      "createdAt": "2025-01-20T10:00:00.000Z",
      "data": {
        "loanId": "uuid",
        "amount": 900.50,
        "dueDate": "2025-01-21T00:00:00.000Z"
      }
    }
  ],
  "unreadCount": 3
}
```

### PATCH /api/notifications

**Request:**
```json
{
  "notificationIds": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "message": "Notifications marked as read",
  "updatedCount": 2
}
```

---

## 9. KYC (Know Your Customer)

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| POST | `/api/kyc/start-ctos` | Start CTOS eKYC process | Yes | - |
| POST | `/api/kyc/start` | Start or reuse KYC session | Yes | - |
| POST | `/api/kyc/:kycId/upload` | Upload KYC documents | Yes* | - |
| GET | `/api/kyc/:kycId/status` | Get KYC session status | Yes* | - |
| POST | `/api/kyc/:kycId/accept` | Accept KYC results | Yes* | - |
| GET | `/api/kyc/user-ctos-status` | Get user's CTOS status | Yes | - |

*Note: Accepts either JWT token or one-time KYC token

### POST /api/kyc/start-ctos

**Request:**
```json
{
  "applicationId": "uuid"
}
```

**Response:**
```json
{
  "kycSessionId": "uuid",
  "ctosRedirectUrl": "https://ctos.example.com/ekyc/...",
  "expiresAt": "2025-01-21T11:30:00.000Z"
}
```

### GET /api/kyc/:kycId/status

**Response:**
```json
{
  "id": "uuid",
  "status": "PENDING",
  "ctosStatus": "IN_PROGRESS",
  "documents": [
    {
      "type": "IC_FRONT",
      "status": "VERIFIED"
    }
  ],
  "verificationResult": null,
  "createdAt": "2025-01-21T10:30:00.000Z"
}
```

### KYC Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | KYC verification pending |
| `IN_PROGRESS` | Verification in progress |
| `VERIFIED` | Successfully verified |
| `FAILED` | Verification failed |
| `EXPIRED` | Session expired |

---

## 10. CTOS Integration

### Endpoints

| Method | Endpoint | Description | Auth | Frontend Route |
|--------|----------|-------------|------|----------------|
| POST | `/api/ctos/create-transaction` | Create CTOS eKYC transaction | No | - |
| POST | `/api/ctos/status` | Get CTOS transaction status | No | - |
| POST | `/api/ctos/webhook` | CTOS webhook receiver | No | - |
| GET | `/api/ctos/session/:id` | Get CTOS session | No | - |

---

## 11. PKI/MTSA Signing

These endpoints are used for digital certificate signing. The backend proxies requests to the on-prem Signing Orchestrator.

### MTSA Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/mtsa/cert-info/:userId` | Get certificate info | Yes |
| POST | `/api/mtsa/request-otp` | Request signing OTP | Yes |
| POST | `/api/mtsa/verify-otp` | Verify signing OTP | Yes |
| POST | `/api/mtsa/request-certificate` | Request new certificate | Yes |

### GET /api/mtsa/cert-info/:userId

**Response:**
```json
{
  "hasCertificate": true,
  "certificateStatus": "ACTIVE",
  "expiresAt": "2026-01-21T00:00:00.000Z",
  "issuedAt": "2025-01-21T10:00:00.000Z"
}
```

### POST /api/mtsa/request-otp

**Request:**
```json
{
  "applicationId": "uuid"
}
```

**Response:**
```json
{
  "message": "OTP sent to registered phone number",
  "expiresAt": "2025-01-21T10:35:00.000Z"
}
```

### POST /api/mtsa/verify-otp

**Request:**
```json
{
  "applicationId": "uuid",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified, document signed successfully",
  "signedAt": "2025-01-21T10:32:00.000Z"
}
```

---

## 12. Settings & Bank Accounts

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/settings/:key` | Get specific setting value | Yes |
| GET | `/api/bank-accounts/default` | Get default bank account | No |

### GET /api/bank-accounts/default

**Response:**
```json
{
  "bankName": "Maybank",
  "accountName": "Company Name Sdn Bhd",
  "accountNumber": "1234567890",
  "swiftCode": "MABORBBXXXX"
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
| 403 | Forbidden - Insufficient permissions or phone verification required |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "message": "Error description"
}
```

### Validation Error (400)

```json
{
  "message": "Phone number is required and must be a string"
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
- Added comprehensive request/response examples
