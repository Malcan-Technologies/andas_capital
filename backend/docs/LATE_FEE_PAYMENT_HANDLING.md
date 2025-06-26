# Late Fee Payment Handling System

## Overview

The Late Fee Payment Handling System processes payments for overdue loan repayments, correctly handling full payments, partial payments, and overpayments while managing late fee status transitions. **Late fees are NEVER automatically waived** - they can only be waived manually by administrators through the admin dashboard.

## Key Features

### 🎯 **Payment Scenarios**
- **Full Payment**: Original amount + all late fees → All late fees marked as `PAID`
- **Partial Late Fee Payment**: Original + partial late fees → Paid portion marked as `PAID`, unpaid portion remains `ACTIVE`
- **Partial Payment**: Less than original amount → Late fees remain `ACTIVE` to continue compounding
- **Overpayment**: More than total due → All late fees `PAID`, excess returned

### 🚫 **No Automatic Waiving**
- **Late fees are NEVER automatically waived** regardless of payment amount
- Only payments that cover the actual late fee amounts will mark them as `PAID`
- Unpaid late fees remain `ACTIVE` and continue to compound

### ✋ **Manual Waiving Only**
- Late fees can only be waived manually by administrators
- Accessible through the admin dashboard with a "Waive Late Fees" button
- Requires a mandatory reason for audit trail
- All waive actions are logged for compliance

### 🔄 **Automatic Integration**
- Triggered automatically when repayment status changes to `COMPLETED`
- Integrated with both admin payment processing and wallet payment systems
- Handles both manual admin payments and customer wallet payments

### 📊 **Payment Priority Logic**
1. **Original Repayment Amount** (principal + interest)
2. **Late Fees** (oldest first, proportional distribution)
3. **Excess Amount** (returned or credited)

## System Architecture

### Core Components

#### 1. **LateFeeProcessor.handleRepaymentCleared()**
```typescript
static async handleRepaymentCleared(
    loanRepaymentId: string,
    paymentAmount: number,
    paymentDate: Date,
    tx?: any
): Promise<{
    success: boolean;
    lateFeesPaid: number;
    lateFeesWaived: number;  // Always 0 - no automatic waiving
    totalLateFees: number;
    remainingPayment: number;
    errorMessage?: string;
}>
```

#### 2. **Manual Waive API Endpoint**
```typescript
POST /api/admin/late-fees/repayment/:repaymentId/waive
{
    reason: string,        // Required - reason for waiving
    adminUserId: string    // Admin user performing the action
}
```

#### 3. **Integration Points**
- `backend/src/api/admin.ts` - Admin payment processing
- `backend/src/api/wallet.ts` - Customer wallet payments
- `admin/app/dashboard/late-fees/page.tsx` - Admin dashboard display and manual waiving

#### 4. **Database Schema**
```sql
-- Late fee status tracking
status VARCHAR DEFAULT 'ACTIVE'  -- ACTIVE, PAID, WAIVED

-- ACTIVE  → Late fee is still owed and compounding
-- PAID    → Late fee has been paid by customer
-- WAIVED  → Late fee has been manually waived by admin
```

## Payment Scenarios

### 📋 **Scenario 1: Full Payment (Original + All Late Fees)**
```
Payment: $1,550 (Original: $1,000 + Late Fees: $550)
Result: All late fees → PAID
```

### 📋 **Scenario 2: Partial Late Fee Payment**
```
Payment: $1,300 (Original: $1,000 + Partial Late Fees: $300 of $550)
Result: 
- $300 of late fees → PAID
- $250 of late fees → ACTIVE (continue compounding)
```

### 📋 **Scenario 3: Original Amount Only**
```
Payment: $1,000 (Original amount exactly)
Result: 
- Late fees: $550 → ACTIVE (continue compounding)
- NO automatic waiving
```

### 📋 **Scenario 4: Partial Payment**
```
Payment: $800 (Less than original $1,000)
Result: 
- Late fees: $550 → ACTIVE (continue compounding)
```

### 📋 **Scenario 5: Manual Admin Waive**
```
Admin Action: Waive with reason "Customer goodwill - long-term client"
Result: 
- Late fees: $550 → WAIVED
- Audit log created with reason and admin user
```

## Admin Dashboard Features

### 🎛️ **Manual Waive Functionality**
- **Location**: Late fee details panel → "Waive Late Fees" button
- **Availability**: Only shown for `ACTIVE` late fees
- **Requirements**: 
  - Mandatory reason field
  - Admin authentication
  - Confirmation dialog
- **Audit Trail**: All waive actions logged with timestamp, reason, and admin user

### 🔍 **Status Filtering**
- **ACTIVE**: Red indicator - still accumulating/owed
- **PAID**: Green indicator - paid by customer
- **WAIVED**: Yellow indicator - manually waived by admin

### 📊 **Visual Indicators**
- Color-coded status badges
- Payment history display
- Outstanding balance warnings
- Audit trail visibility

## Implementation Details

### 🔧 **Removed Automatic Waiving Logic**
**Previous behavior (REMOVED):**
```typescript
// OLD CODE - REMOVED
if (paymentAmount >= originalAmount) {
    // Payment covers original amount exactly, waive all late fees
    lateFeesWaived = totalLateFees;
    // Mark as WAIVED
}
```

**New behavior:**
```typescript
// NEW CODE - NO AUTOMATIC WAIVING
// Late fees only marked as PAID when payment actually covers them
// Unpaid portions remain ACTIVE to continue compounding
```

### 🛡️ **Security & Audit**
- All waive actions require admin authentication
- Mandatory reason field prevents accidental waiving
- Complete audit trail in `late_fee_processing_logs`
- Waive actions logged with `status: 'MANUAL_WAIVED'`

### 📝 **Audit Log Structure**
```json
{
  "type": "manual_waive",
  "loanRepaymentId": "repayment_id",
  "totalWaivedAmount": 550.00,
  "reason": "Customer goodwill - long-term client",
  "adminUserId": "admin_user_id",
  "waivedAt": "2025-01-01T10:00:00Z",
  "waivedFees": [
    {
      "id": "fee_id",
      "amount": 550.00,
      "calculationDate": "2024-12-01"
    }
  ]
}
```

## Business Rules

### ✅ **Payment Processing Rules**
1. **Payments only mark late fees as PAID when they actually cover the fee amount**
2. **No automatic waiving under any circumstances**
3. **Partial payments leave unpaid portions as ACTIVE**
4. **Late fees continue to compound until paid or manually waived**

### ✅ **Manual Waiving Rules**
1. **Only administrators can waive late fees**
2. **Waiving requires a mandatory business reason**
3. **All waive actions are permanently logged**
4. **Waived fees cannot be "un-waived" (irreversible)**

### ✅ **Status Transition Rules**
- `ACTIVE` → `PAID` (via payment)
- `ACTIVE` → `WAIVED` (via manual admin action)
- `PAID` → No transitions (final state)
- `WAIVED` → No transitions (final state)

## Testing & Validation

### 🧪 **Test Coverage**
- ✅ Payment processing scenarios (no automatic waiving)
- ✅ Manual waive functionality
- ✅ Audit trail creation
- ✅ Admin dashboard integration
- ✅ Status filtering and display

### 🔍 **Validation Points**
- Late fees never automatically waived
- Manual waive requires reason
- Audit logs properly created
- Status transitions work correctly
- UI shows correct status indicators

## Migration Notes

### ⚠️ **Breaking Changes**
- **Automatic waiving removed**: Payments covering only the original amount no longer automatically waive late fees
- **Manual intervention required**: Administrators must now manually waive fees when appropriate
- **Business process change**: Customer service teams need to be trained on the new manual waiving process

### 🔄 **Backward Compatibility**
- Existing `WAIVED` fees remain unchanged
- Previous audit logs preserved
- API endpoints maintain same response structure
- Database schema unchanged

## Summary

The Late Fee Payment Handling System now enforces strict business rules where **late fees are only marked as PAID when actually paid by customers, and can only be WAIVED through manual administrator action**. This ensures proper financial controls, complete audit trails, and prevents accidental fee forgiveness while still allowing for legitimate customer service decisions. 