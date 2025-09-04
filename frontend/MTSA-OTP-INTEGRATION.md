# MTSA OTP Integration - Frontend Implementation

## Overview

This implementation adds OTP verification for MTSA (MyTrustSigner) digital certificate enrollment and signing between attestation completion and DocuSeal signing.

## Flow

1. **Attestation** → User completes loan terms attestation
2. **Certificate Check** → System checks if user has valid digital certificate
3. **OTP Request** → Send OTP for either:
   - New Certificate Enrollment (NU) - if no valid certificate exists
   - Digital Signing (DS) - if valid certificate exists
4. **OTP Verification** → User enters OTP from email
5. **Certificate Processing** → Complete enrollment or verify signing capability
6. **DocuSeal Signing** → Proceed to document signing with digital certificate

## New Components

### 1. OTPVerificationForm.tsx
- Checks certificate status automatically
- Handles OTP request based on certificate status
- Provides clear UI for certificate status and OTP verification
- Includes countdown timer and resend functionality

### 2. API Routes

#### `/api/mtsa/certificate/[userId]` - GET
- Checks if user has a valid digital certificate
- Calls signing orchestrator `/api/cert/{userId}`

#### `/api/mtsa/request-otp` - POST
- Requests OTP for certificate enrollment or signing verification
- Calls signing orchestrator `/api/otp`
- Supports both DS (digital signing) and NU (new enrollment) usage

#### `/api/mtsa/verify-otp` - POST
- Verifies OTP and completes certificate enrollment
- Calls signing orchestrator `/api/enroll`

## Updated Components

### 1. AttestationPage (`app/dashboard/applications/[id]/attestation/page.tsx`)
- Added step management: 'attestation' → 'otp' → 'completed'
- Updated flow to include OTP verification before DocuSeal signing
- Enhanced error handling and navigation

### 2. LoanApplication Interface
- Added `idNumber` field to user interface for MTSA verification

## Configuration

The implementation uses these environment variables with fallbacks:
- `SIGNING_ORCHESTRATOR_URL` (default: http://localhost:4010)
- `SIGNING_ORCHESTRATOR_API_KEY` (fallback to DOCUSEAL_API_TOKEN)

## User Experience

### Certificate Status Display
- **Valid Certificate**: Green notification about existing certificate for signing
- **No Certificate**: Blue notification about certificate enrollment requirement

### OTP Flow
- Step-by-step progression with clear visual indicators
- Email-based OTP with 5-minute validity
- Countdown timer and resend functionality
- Clear error messages and success feedback

### Navigation
- Back button support between steps
- Proper error handling with fallback routes

## Integration with MTSA

The frontend integrates with the MTSA signing orchestrator:

1. **Certificate Check**: `GetCertInfo` API to determine OTP usage
2. **OTP Request**: `RequestEmailOTP` with DS/NU usage based on certificate status
3. **Certificate Enrollment**: `RequestCertificate` with OTP verification
4. **Digital Signing**: Proceeds to DocuSeal with verified certificate

## Error Handling

- Network errors with retry mechanisms
- Invalid OTP with clear error messages
- Certificate enrollment failures with detailed feedback
- Graceful fallbacks for partial success scenarios

## Security

- OTP verification through secure MTSA channels
- Certificate validation before signing
- Proper error message sanitization
- Secure API key handling

## Testing

To test the implementation:

1. Ensure MTSA signing orchestrator is running
2. User must have `idNumber` in database
3. Complete attestation form
4. Verify OTP flow with real email
5. Confirm DocuSeal integration works

## Production Considerations

1. Set proper environment variables for production MTSA endpoints
2. Configure email delivery for OTP messages
3. Set up monitoring for certificate enrollment failures
4. Implement proper logging for audit trails
