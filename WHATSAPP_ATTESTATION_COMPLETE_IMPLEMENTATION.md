# WhatsApp Attestation Complete Notification Implementation

## Overview
Added a new WhatsApp notification that is triggered when a user completes attestation for their loan application. This notification is sent for both instant attestation (completed by the user) and live attestation (completed by admin after video call).

## Template Details
- **Template Name**: `attestation_complete`
- **Message**: "Hi {{1}}. You have completed attestation for your {{2}} loan application of RM {{3}}. Please proceed to the next step by logging in to your loan dashboard."
- **Parameters**:
  1. Customer full name
  2. Product name
  3. Loan amount

## Changes Made

### 1. Backend WhatsApp Service (`backend/src/lib/whatsappService.ts`)
- Added new method `sendAttestationCompleteNotification()` to WhatsAppService class
- Method checks if:
  - WhatsApp notifications are globally enabled (`ENABLE_WHATSAPP_NOTIFICATIONS`)
  - Attestation complete notifications are specifically enabled (`WHATSAPP_ATTESTATION_COMPLETE`)
- Sends notification using the `attestation_complete` template with customer name, product name, and loan amount

### 2. Loan Applications API (`backend/src/api/loan-applications.ts`)
- Added WhatsApp notification trigger in the `POST /:id/complete-attestation` endpoint
- Sends notification after user successfully completes instant attestation
- Notification sent asynchronously (non-blocking) with error logging

**Trigger Conditions (User Instant Attestation)**:
- Application status is `PENDING_ATTESTATION`
- User completes instant attestation (watches video and accepts terms)
- Status changes to `CERT_CHECK`
- User has a phone number

### 3. Admin API (`backend/src/api/admin.ts`)
- Added WhatsApp notification trigger in the `POST /applications/:id/complete-live-attestation` endpoint
- Sends notification after admin marks live video call attestation as complete
- Notification sent asynchronously (non-blocking) with error logging

**Trigger Conditions (Live Attestation by Admin)**:
- Application status is `PENDING_ATTESTATION`
- Attestation type is `MEETING`
- Admin completes live video call attestation
- Status changes to `CERT_CHECK`
- User has a phone number

### 4. Database Seed (`backend/prisma/seed.ts`)
- Added new system setting `WHATSAPP_ATTESTATION_COMPLETE` to notification settings array
- Configuration:
  - **Key**: `WHATSAPP_ATTESTATION_COMPLETE`
  - **Category**: `NOTIFICATIONS`
  - **Name**: "WhatsApp Attestation Complete"
  - **Description**: "Send WhatsApp notifications when attestation is completed (instant or live)"
  - **Data Type**: `BOOLEAN`
  - **Default Value**: `true` (enabled by default)
  - **Active**: `true` (user can enable/disable)
  - **Requires Restart**: `false`
  - **Affects Existing Loans**: `false`

### 5. Admin Settings Page (`admin/app/dashboard/settings/page.tsx`)
- Added icon mapping for `WHATSAPP_ATTESTATION_COMPLETE`: ✍️
- Added color scheme for the notification card: indigo theme (`bg-indigo-800/20 border-indigo-700/30`)
- The setting will automatically appear in the Notifications tab under WhatsApp Notifications section

## User Flows

### Flow 1: Instant Attestation (User-Initiated)
1. User completes loan application submission
2. Application status changes to `PENDING_ATTESTATION`
3. User navigates to attestation page (`/dashboard/applications/:id/attestation`)
4. User watches attestation video
5. User accepts attestation terms
6. User submits attestation form
7. Frontend calls `POST /api/loan-applications/:id/complete-attestation`
8. Backend:
   - Updates application status to `CERT_CHECK`
   - Marks attestation as completed
   - Creates loan and repayment schedule
   - Checks if notification is enabled
   - If enabled, sends WhatsApp message to user's phone number
   - Returns success response to frontend
9. User receives WhatsApp confirmation message
10. User redirected to certificate check page

### Flow 2: Live Attestation (Admin-Initiated)
1. User selects "Schedule Live Video Call" option during attestation
2. Application status changes to `PENDING_ATTESTATION` with attestation type `MEETING`
3. Request appears in admin panel at `/dashboard/live-attestations`
4. Admin conducts live video call with user
5. Admin marks attestation as complete in admin panel
6. Admin panel calls `POST /api/admin/applications/:id/complete-live-attestation`
7. Backend:
   - Updates application status to `CERT_CHECK`
   - Marks attestation as completed
   - Records meeting completion timestamp
   - Creates loan and repayment schedule
   - Checks if notification is enabled
   - If enabled, sends WhatsApp message to user's phone number
   - Returns success response to admin panel
8. User receives WhatsApp confirmation message
9. Admin sees success confirmation

## Admin Configuration

Admins can enable/disable this notification from the Admin Panel:
1. Navigate to Settings → Notifications tab
2. Scroll to "WhatsApp Notifications" section
3. Find "Attestation Complete" notification card (indigo, with ✍️ icon)
4. Toggle the setting on/off
5. Save changes

## Testing Checklist

- [ ] Verify WhatsApp template `attestation_complete` is created in Meta Business Manager
- [ ] Test notification is sent when user completes instant attestation
- [ ] Test notification is sent when admin completes live attestation
- [ ] Verify notification is NOT sent if global WhatsApp setting is disabled
- [ ] Verify notification is NOT sent if specific `WHATSAPP_ATTESTATION_COMPLETE` setting is disabled
- [ ] Test that correct customer name, product name, and amount appear in message
- [ ] Verify notification doesn't block attestation completion if WhatsApp API fails
- [ ] Check that admin can toggle the setting in Settings → Notifications tab
- [ ] Verify both instant and live attestation flows work end-to-end

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

**IMPORTANT**: You must create the `attestation_complete` template in your Meta WhatsApp Business Manager before this feature will work.

Template configuration:
- **Category**: UTILITY
- **Language**: English (or your preferred language)
- **Body**:
  ```
  Hi {{1}}. You have completed attestation for your {{2}} loan application of RM {{3}}.

  Please proceed to the next step by logging in to your loan dashboard.
  ```
- **Variables**: 3 (Customer name, Product name, Amount)

## Error Handling

- All WhatsApp notification errors are logged but do not block the attestation completion
- If WhatsApp API is down, attestation will still be marked as complete successfully
- Errors are logged with prefix: "Failed to send attestation complete WhatsApp notification:"
- Both user and admin endpoints handle errors gracefully

## Technical Implementation Details

### Instant Attestation Endpoint
- **Route**: `POST /api/loan-applications/:id/complete-attestation`
- **Authentication**: User token required (`authenticateAndVerifyPhone`)
- **Status Flow**: `PENDING_ATTESTATION` → `CERT_CHECK`
- **Side Effects**: 
  - Creates loan record
  - Generates repayment schedule
  - Sends WhatsApp notification
  - Tracks status change in history

### Live Attestation Endpoint
- **Route**: `POST /api/admin/applications/:id/complete-live-attestation`
- **Authentication**: Admin or Attestor token required (`requireAdminOrAttestor`)
- **Status Flow**: `PENDING_ATTESTATION` → `CERT_CHECK`
- **Side Effects**:
  - Creates loan record
  - Generates repayment schedule
  - Records meeting completion timestamp
  - Sends WhatsApp notification
  - Tracks status change in history

## Notes

- Notification is sent asynchronously using `.catch()` to prevent blocking the API response
- Phone numbers are automatically cleaned (removing '+' prefix) before sending to WhatsApp API
- Amount is sent as-is from the database (should be formatted on WhatsApp template if needed)
- Setting can be toggled in real-time without server restart
- The same notification is sent regardless of attestation type (instant or live)
- Frontend pages do not need modification as the notification is triggered from backend automatically

## Related Files

### Backend
- `backend/src/lib/whatsappService.ts` - WhatsApp service with new notification method
- `backend/src/api/loan-applications.ts` - User attestation completion endpoint
- `backend/src/api/admin.ts` - Admin live attestation completion endpoint
- `backend/prisma/seed.ts` - Database seed with new setting

### Frontend
- `frontend/app/dashboard/applications/[id]/attestation/page.tsx` - User attestation page
- `admin/app/dashboard/live-attestations/page.tsx` - Admin live attestations page
- `admin/app/dashboard/settings/page.tsx` - Admin settings page with notification toggle

## Integration Points

This notification integrates with:
1. **Attestation Flow**: Sent after attestation is successfully completed
2. **Loan Creation**: Triggered at the same time loan records are created
3. **Status Tracking**: Logged alongside status change history
4. **Admin Panel**: Configurable via Settings → Notifications
5. **User Journey**: Confirms completion and guides user to next step

## Success Metrics

Track the following to measure success:
- Number of attestation complete notifications sent
- Delivery success rate
- User engagement after receiving notification
- Time to next step (certificate check) after notification
- Admin usage of live attestation feature
- User preference for instant vs live attestation

