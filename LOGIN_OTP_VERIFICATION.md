# Login OTP Verification Flow

## Overview
Enhanced the login flow to handle unverified phone numbers by redirecting users to an OTP verification page instead of showing an error message.

## Implementation Details

### Backend Changes (`backend/src/api/auth.ts`)
- **Modified login endpoint** to automatically send OTP when phone verification is required
- **Added automatic OTP sending** when user's phone is not verified during login
- **Rate limiting protection** to prevent OTP spam
- **Graceful error handling** if OTP sending fails

### Frontend Changes (`frontend/app/login/page.tsx`)
- **Added OTP verification state management**
- **Integrated OTPVerification component** from signup flow
- **Seamless transition** from login form to OTP verification
- **Handles 403 response** with `requiresPhoneVerification: true`
- **Automatic token storage** after successful OTP verification

## User Flow

1. **User attempts login** with phone number and password
2. **Backend validates credentials** and checks phone verification status
3. **If phone not verified**:
   - Backend automatically sends OTP via WhatsApp (rate limited)
   - Returns 403 status with `requiresPhoneVerification: true`
   - Frontend shows OTP verification screen
4. **User enters OTP** received via WhatsApp
5. **OTP verification succeeds**:
   - User phone marked as verified
   - Authentication tokens returned
   - User redirected to dashboard or intended page
6. **If OTP needed again**, user can click "Resend Code" button

## Key Features

- **Automatic OTP sending** during login attempt
- **Rate limiting** (1 OTP per minute per phone number)
- **Graceful fallback** if OTP sending fails
- **Resend functionality** with rate limiting
- **Consistent UI/UX** with signup flow
- **Proper error handling** and user feedback
- **Redirect preservation** to intended page after verification

## API Endpoints Used

- `POST /api/auth/login` - Enhanced to auto-send OTP for unverified phones
- `POST /api/auth/verify-otp` - Verifies OTP and returns tokens
- `POST /api/auth/resend-otp` - Resends OTP with rate limiting

## Error Handling

- **Invalid credentials**: Standard login error
- **Phone not verified**: Automatic OTP send + verification screen
- **OTP send failure**: User can still request resend manually
- **Rate limiting**: Clear messages about wait times
- **Invalid OTP**: User can try again or request new OTP

## Security Features

- **Rate limiting**: 1 OTP per minute per phone number
- **OTP expiry**: 5 minutes
- **Attempt limiting**: Maximum 5 attempts per OTP
- **Secure OTP generation**: Uses crypto.randomInt
- **Phone validation**: Comprehensive phone number validation

## Testing

To test the flow:
1. Create a user account via signup
2. Don't verify the phone number during signup
3. Attempt to login with the same credentials
4. Verify you're redirected to OTP verification page
5. Check WhatsApp for verification code
6. Complete verification and confirm redirect to dashboard 