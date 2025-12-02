# WhatsApp Loan Application Submission Notification Implementation

## Overview
Added a new WhatsApp notification that is triggered when a user submits a loan application. This notification confirms the submission and informs the user that their application is being reviewed.

## Template Details
- **Template Name**: `loan_application_submission`
- **Message**: "Hi {{1}}. Your loan for {{2}} amounting to RM {{3}} has been submitted. We will review your application and get back to you with the next steps. There is no further action required from you at this time."
- **Parameters**:
  1. Customer full name
  2. Product name
  3. Loan amount

## Changes Made

### 1. Backend WhatsApp Service (`backend/src/lib/whatsappService.ts`)
- Added new method `sendLoanApplicationSubmissionNotification()` to WhatsAppService class
- Method checks if:
  - WhatsApp notifications are globally enabled (`ENABLE_WHATSAPP_NOTIFICATIONS`)
  - Loan application submission notifications are specifically enabled (`WHATSAPP_LOAN_APPLICATION_SUBMISSION`)
- Sends notification using the `loan_application_submission` template with customer name, product name, and loan amount

### 2. Loan Applications API (`backend/src/api/loan-applications.ts`)
- Imported `whatsappService` module
- Modified PATCH `/:id` endpoint to:
  - Include user phone number and product name in the transaction query
  - Trigger WhatsApp notification when application status changes to `PENDING_APPROVAL` or `COLLATERAL_REVIEW`
  - Send notification asynchronously (non-blocking) with error logging
  
**Trigger Conditions**: Notification is sent when:
- Application status is updated (via PATCH)
- New status is either `PENDING_APPROVAL` or `COLLATERAL_REVIEW`
- Previous status was different from new status
- User has a phone number

### 3. Database Seed (`backend/prisma/seed.ts`)
- Added new system setting `WHATSAPP_LOAN_APPLICATION_SUBMISSION` to notification settings array
- Configuration:
  - **Key**: `WHATSAPP_LOAN_APPLICATION_SUBMISSION`
  - **Category**: `NOTIFICATIONS`
  - **Name**: "WhatsApp Loan Application Submission"
  - **Description**: "Send WhatsApp notifications when loan applications are submitted"
  - **Data Type**: `BOOLEAN`
  - **Default Value**: `true` (enabled by default)
  - **Active**: `true` (user can enable/disable)
  - **Requires Restart**: `false`
  - **Affects Existing Loans**: `false`

### 4. Admin Settings Page (`admin/app/dashboard/settings/page.tsx`)
- Added icon mapping for `WHATSAPP_LOAN_APPLICATION_SUBMISSION`: 📝
- Added color scheme for the notification card: blue theme (`bg-blue-800/20 border-blue-700/30`)
- The setting will automatically appear in the Notifications tab under WhatsApp Notifications section

## User Flow

1. User fills out loan application form in frontend
2. User reaches the Review & Submit step
3. User accepts terms and submits application
4. Frontend calls PATCH `/api/loan-applications/:id` with status = `PENDING_APPROVAL` or `COLLATERAL_REVIEW`
5. Backend:
   - Updates application status in database
   - Checks if notification is enabled
   - If enabled, sends WhatsApp message to user's phone number
   - Returns success response to frontend
6. User receives WhatsApp confirmation message

## Admin Configuration

Admins can enable/disable this notification from the Admin Panel:
1. Navigate to Settings → Notifications tab
2. Scroll to "WhatsApp Notifications" section
3. Find "Loan Application Submission" notification card (blue, with 📝 icon)
4. Toggle the setting on/off
5. Save changes

## Testing Checklist

- [ ] Verify WhatsApp template `loan_application_submission` is created in Meta Business Manager
- [ ] Test notification is sent when application is submitted for regular loans
- [ ] Test notification is sent when application is submitted for collateral loans
- [ ] Verify notification is NOT sent if global WhatsApp setting is disabled
- [ ] Verify notification is NOT sent if specific `WHATSAPP_LOAN_APPLICATION_SUBMISSION` setting is disabled
- [ ] Test that correct customer name, product name, and amount appear in message
- [ ] Verify notification doesn't block application submission if WhatsApp API fails
- [ ] Check that admin can toggle the setting in Settings → Notifications tab

## Database Migration

The new setting is added via the seed script. 

### Development Database
```bash
cd backend
docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
docker compose -f docker-compose.dev.yml restart backend
```

### Production Database
```bash
cd backend
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
docker compose -f docker-compose.prod.yml restart backend
```

**✅ COMPLETED**: Both development and production databases have been seeded with the new setting and backend services have been restarted.

## Meta WhatsApp Template Setup

**IMPORTANT**: You must create the `loan_application_submission` template in your Meta WhatsApp Business Manager before this feature will work.

Template configuration:
- **Category**: UTILITY
- **Language**: English (or your preferred language)
- **Body**: 
  ```
  Hi {{1}}. Your loan for {{2}} amounting to RM {{3}} has been submitted.

  We will review your application and get back to you with the next steps. There is no further action required from you at this time.
  ```
- **Variables**: 3 (Customer name, Product name, Amount)

## Error Handling

- All WhatsApp notification errors are logged but do not block the application submission
- If WhatsApp API is down, application will still be submitted successfully
- Errors are logged with prefix: "Failed to send loan application submission WhatsApp notification:"

## Notes

- Notification is sent asynchronously using `.catch()` to prevent blocking the API response
- Phone numbers are automatically cleaned (removing '+' prefix) before sending to WhatsApp API
- Amount is sent as-is from the database (should be formatted on WhatsApp template if needed)
- Setting can be toggled in real-time without server restart

