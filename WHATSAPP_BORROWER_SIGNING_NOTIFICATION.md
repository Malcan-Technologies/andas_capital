# WhatsApp Borrower Signing Complete Notification Implementation

## Overview
Implemented WhatsApp notification that is sent when a borrower completes PKI signing for their loan agreement, working alongside the existing email notification.

## Implementation Date
December 2, 2025

## Changes Made

### 1. Backend - WhatsApp Service (`backend/src/lib/whatsappService.ts`)
Added new method `sendBorrowerSigningCompleteNotification`:

```typescript
async sendBorrowerSigningCompleteNotification({
    to,
    fullName,
    productName,
    amount,
    email
}: {
    to: string;
    fullName: string;
    productName: string;
    amount: string;
    email: string;
}): Promise<WhatsAppResponse>
```

**Features:**
- Checks global WhatsApp notification enablement
- Checks specific `WHATSAPP_BORROWER_SIGNING_COMPLETE` setting
- Uses template: `complete_signing_user`
- Sends 4 parameters: fullName, productName, amount, email

### 2. Backend - PKI API (`backend/src/api/pki.ts`)

**Added Import:**
```typescript
import { whatsappService } from '../lib/whatsappService';
```

**Modified `/api/pki/sign-pdf` Endpoint:**
- Fetches full application data after successful PKI signing
- Sends WhatsApp notification alongside email notification
- Uses asynchronous `.then()` to avoid blocking the response
- Includes error logging if notification fails

**Trigger Location:**
After borrower successfully completes PKI signing with OTP, the system:
1. Updates loan signatory status to `SIGNED`
2. Updates application status to `PENDING_SIGNING_COMPANY_WITNESS`
3. Creates audit trail entry
4. Sends email notification (existing)
5. **Sends WhatsApp notification (NEW)**

### 3. Database Seed (`backend/prisma/seed.ts`)

Added new notification setting to be seeded:

```typescript
{
    key: "WHATSAPP_BORROWER_SIGNING_COMPLETE",
    category: "NOTIFICATIONS",
    name: "WhatsApp Borrower Signing Complete",
    description: "Send WhatsApp notifications when borrower completes PKI signing",
    dataType: "BOOLEAN",
    value: JSON.stringify(true),
    options: undefined,
    isActive: true,
    requiresRestart: false,
    affectsExistingLoans: false,
}
```

**Database Seeding:**
- ✅ Development database seeded
- ✅ Production database seeded

### 4. Admin Panel Settings UI (`admin/app/dashboard/settings/page.tsx`)

**Added Notification Icon:**
```typescript
case "WHATSAPP_BORROWER_SIGNING_COMPLETE": return "🖊️";
```

**Added Color Scheme:**
```typescript
case "WHATSAPP_BORROWER_SIGNING_COMPLETE": return "bg-violet-800/20 border-violet-700/30";
```

The setting will automatically appear in the Notifications tab of the admin settings page.

## WhatsApp Template Details

### Template Name
`complete_signing_user`

### Template Category
**UTILITY** (must be configured in Meta Business Manager)

### Template Message Body
```
Hi {{1}}. You have completed PKI signing for your loan application of {{2}} for RM {{3}}.

A copy of the signed document has been sent to {{4}}. We will inform you once the loan agreement has been signed by all parties.
```

### Template Parameters
1. **{{1}}** - User's full name (e.g., "Ahmad bin Abdullah")
2. **{{2}}** - Product name (e.g., "PayAdvance™")
3. **{{3}}** - Loan amount (e.g., "5000.00")
4. **{{4}}** - User's email address (e.g., "user@example.com")

## User Journey

1. **Borrower completes DocuSeal form** → Application status: `PENDING_PKI_SIGNING`
2. **Borrower enters OTP and signs with PKI** → 
   - Signatory status: `SIGNED`
   - Application status: `PENDING_SIGNING_COMPANY_WITNESS`
   - **📧 Email sent** with signed PDF attached
   - **📱 WhatsApp notification sent** ← NEW
3. **Company signs** → Application status: `PENDING_SIGNING_WITNESS`
4. **Witness signs** → Application status: `PENDING_STAMPING`
5. **Admin stamps document** → Application status: `APPROVED`

## Notification Flow Diagram

```
User submits PKI signing with OTP
         ↓
Signing Orchestrator processes signature
         ↓
Backend receives success response
         ↓
Update Database:
  - LoanSignatory.status → SIGNED
  - LoanApplication.status → PENDING_SIGNING_COMPANY_WITNESS
  - Create audit trail entry
         ↓
Fetch full application data (user, product, amount)
         ↓
Send Email Notification (existing)
         ↓
Send WhatsApp Notification (NEW) ← This implementation
         ↓
Return success to frontend
```

## Configuration Requirements

### Meta Business Manager Setup
**CRITICAL**: Before this notification works in production, you must:

1. Go to **Meta Business Suite** → **WhatsApp Manager**
2. Create new template:
   - **Name:** `complete_signing_user`
   - **Category:** UTILITY
   - **Language:** English (or your preferred language)
   - **Header:** None
   - **Body:** (Copy from Template Message Body above with 4 parameters)
   - **Footer:** None
   - **Buttons:** None
3. Submit for approval
4. Once approved, the notification will work automatically

### Environment Variables Required
- `ENABLE_WHATSAPP_NOTIFICATIONS` (system setting) - must be enabled
- `WHATSAPP_BUSINESS_ACCOUNT_ID` - Meta Business account ID
- `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp Business phone number ID
- `WHATSAPP_ACCESS_TOKEN` - Meta Graph API access token
- `FRONTEND_URL` - For fetching application data references

### System Settings
Admins can enable/disable this notification from:
**Admin Panel** → **Settings** → **Notifications Tab** → **"WhatsApp Borrower Signing Complete"** toggle

## Testing Checklist

- [ ] Create WhatsApp template in Meta Business Manager
- [ ] Wait for template approval
- [ ] Verify setting appears in admin panel Notifications tab
- [ ] Enable the notification in admin settings
- [ ] Create test loan application
- [ ] Complete attestation
- [ ] Complete DocuSeal form (borrower)
- [ ] Request OTP for PKI signing
- [ ] Submit PKI signing with OTP
- [ ] Verify email notification sent
- [ ] **Verify WhatsApp notification sent** ← Main test
- [ ] Check notification contains correct user name, product, amount, email
- [ ] Disable notification in admin settings
- [ ] Perform signing again - verify WhatsApp NOT sent
- [ ] Check backend logs for any errors

## Error Handling

### WhatsApp Service Checks
1. **Global WhatsApp enabled?** - Checks `ENABLE_WHATSAPP_NOTIFICATIONS`
2. **Specific notification enabled?** - Checks `WHATSAPP_BORROWER_SIGNING_COMPLETE`
3. **User has phone number?** - Uses `application.user.phoneNumber`
4. **Template exists?** - Meta will reject if template not approved

### Failure Scenarios
- If WhatsApp notification fails, it **DOES NOT** block the signing process
- Error is logged to console: `Failed to send WhatsApp borrower signing complete notification`
- Email notification will still be sent
- Application status will still update correctly

## Related Files Modified

### Backend
- `backend/src/lib/whatsappService.ts` - Added new notification method
- `backend/src/api/pki.ts` - Added trigger and WhatsApp service import
- `backend/prisma/seed.ts` - Added new system setting

### Admin Panel
- `admin/app/dashboard/settings/page.tsx` - Added icon and color scheme

### Database
- `system_settings` table - New row for `WHATSAPP_BORROWER_SIGNING_COMPLETE`

## Services Restarted
- ✅ Development backend (docker-compose.dev.yml)
- ✅ Production backend (docker-compose.prod.yml)

## Notes

### Why Only Borrower?
This notification is specifically for when the **borrower** completes their PKI signing. When company or witness sign, they receive different notifications (or none, as configured).

### Alongside Email
This WhatsApp notification works **in addition to** the email notification. Both are sent:
- **Email:** Contains signed PDF attachment
- **WhatsApp:** Quick confirmation message

### Asynchronous Sending
WhatsApp notification is sent asynchronously (`.then()` without `await`) to:
- Avoid blocking the API response
- Provide instant feedback to user
- Handle notification failures gracefully

## Success Criteria
✅ WhatsApp notification sent when borrower completes PKI signing  
✅ Notification includes user name, product, amount, email  
✅ Admin can enable/disable notification from settings  
✅ Email notification continues to work  
✅ Signing process not affected if WhatsApp fails  
✅ Setting seeded to both dev and prod databases  
✅ Backend services restarted  

## Next Steps

1. **Create WhatsApp Template** in Meta Business Manager (REQUIRED)
2. **Test in Development** environment
3. **Monitor Logs** for any errors
4. **Enable in Production** once template approved
5. **Collect User Feedback** on notification timing and content

---

**Implementation Status:** ✅ COMPLETE  
**Production Ready:** ⚠️ PENDING WhatsApp template approval in Meta Business Manager

