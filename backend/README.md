# Backend Setup Guide

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://kapital:kapital123@localhost:5432/kapital"

# JWT Secrets
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this-in-production"

# Server
PORT=4001
NODE_ENV=development

# CORS Origins (comma-separated)
CORS_ORIGIN="http://localhost:3000,http://localhost:3001,http://localhost:3002"

# WhatsApp Cloud API Configuration
# Get these from Meta Business Manager > WhatsApp > API Setup
WHATSAPP_ACCESS_TOKEN="your_whatsapp_access_token_here"
WHATSAPP_PHONE_NUMBER_ID="your_whatsapp_phone_number_id_here"
```

## WhatsApp OTP Integration

The backend includes WhatsApp Cloud API integration for OTP verification during user signup. 

### Setup WhatsApp Cloud API:

1. **Create a Meta Business Account**: Go to [Meta Business Manager](https://business.facebook.com/)
2. **Add WhatsApp Product**: Add WhatsApp to your business account
3. **Get API Credentials**:
   - `WHATSAPP_ACCESS_TOKEN`: Your app's access token
   - `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Business phone number ID
4. **Create Message Template**: The system uses a template named `otp_verification` with the following structure:
   - **Template Name**: `otp_verification`
   - **Category**: Authentication
   - **Language**: English
   - **Body**: `{{1}} is your verification code. For your security, do not share this code.`
   - **Footer**: `This code expires in 5 minutes.`

### Development Mode:

If you leave the WhatsApp environment variables empty, the system will:
- Log OTP codes to the console instead of sending them
- Still create OTP records in the database for testing

### API Endpoints:

- `POST /api/auth/signup` - Creates user and sends OTP
- `POST /api/auth/verify-otp` - Verifies OTP and returns authentication tokens
- `POST /api/auth/resend-otp` - Resends OTP with rate limiting
- `POST /api/auth/login` - Login (requires phone verification)

### Database Schema:

The integration adds:
- `phoneVerified` field to users table
- `phone_verifications` table for OTP management

## Installation

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Features

- Phone number validation and normalization
- Secure OTP generation (6-digit, 5-minute expiry)
- Rate limiting (1 OTP per minute per phone number)
- WhatsApp message delivery via approved template
- Automatic cleanup of expired OTPs
- Phone verification requirement for protected routes
