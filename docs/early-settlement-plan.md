# Early Settlement (Early Discharge) – Functional Plan

## Goals
- Allow borrowers to settle a loan early via the existing payment modal.
- Replace the “Full Balance” button with “Settle Early” when eligible.
- Compute a settlement quote using admin-configurable rules and enforce a lock‑in period.
- Route requests through admin review (approve/reject) with safe rollback and auditability.

## Business Rules
- Eligibility
  - Feature toggle: must be enabled in system settings.
  - Lock‑in period: early settlement is blocked until `disbursedAt + lockInMonths`.
  - Loans with status other than `ACTIVE` are not eligible (e.g., already discharged).
- Settlement calculation
  - Formula: `remainingPrincipal - (remainingInterest * discountFactor) + earlySettlementFee [+ unpaidLateFees]`.
  - remainingPrincipal: current `loan.outstandingBalance` or sum of remaining principal.
  - remainingInterest: sum of future scheduled interest amounts from `loan_repayments` where `status != PAID` and `dueDate >= today`.
  - discountFactor: admin-configurable (0.0–1.0). Multiply by remainingInterest to compute discount credit.
  - earlySettlementFee: fixed or percentage of remainingPrincipal (admin-configurable).
  - unpaidLateFees: optional add‑on; include any accrued but unpaid late fees (configurable).
  - Rounding: round to 2 decimals (MYR) with consistent rounding mode (configurable or default bankers/half‑up).
- Approval & posting
  - Create a pending wallet transaction (`type: "EARLY_SETTLEMENT"`, `status: PENDING`) with quote breakdown stored in metadata.
  - Admin approves or rejects. No schedule mutation occurs until approval.
  - On approval: post the transaction, close/reconcile remaining schedule, set `loan.status = DISCHARGED`, `loan.outstandingBalance = 0`, and `loan.dischargedAt = now()`.
  - On rejection: simply mark the transaction `REJECTED`; the schedule remains unchanged.

## System Settings (system_settings)
- EARLY_SETTLEMENT_ENABLED (BOOLEAN) – default false.
- EARLY_SETTLEMENT_LOCK_IN_MONTHS (NUMBER) – e.g., 3.
- EARLY_SETTLEMENT_DISCOUNT_FACTOR (NUMBER) – 0.0–1.0; default 0.0.
- EARLY_SETTLEMENT_FEE_TYPE (ENUM) – "FIXED" | "PERCENT"; default FIXED.
- EARLY_SETTLEMENT_FEE_VALUE (NUMBER) – amount or percent value.
- EARLY_SETTLEMENT_INCLUDE_LATE_FEES (BOOLEAN) – default true.
- EARLY_SETTLEMENT_ROUNDING_MODE (ENUM) – "HALF_UP" | "HALF_EVEN"; default HALF_UP.
- UPCOMING_PAYMENT_CHECK_TIME etc. remain as is (no change) – listed here for awareness.

Each setting is stored as a row in `system_settings` with JSON‑serialized `value` and a human readable `name/description`. Changes are surfaced on the Admin Settings page (Signing/Loans section).

## Data Model & Audit
- Prefer minimal DB changes by using existing `wallet_transactions`:
  - `type`: "EARLY_SETTLEMENT"
  - `status`: PENDING | APPROVED | REJECTED
  - `metadata` Json captures: { kind: "early_settlement", quote: { remainingPrincipal, remainingInterest, discountFactor, discountAmount, feeType, feeValue, feeAmount, includeLateFees, lateFeesAmount, totalSettlement, computedAt }, schedulePreview?: { counts, firstPendingDue, lastDue } }
- Optional (future): add an `early_settlement_requests` table for richer audit if needed. Not required for first release.

## API Design (Backend)
- POST `/api/loans/:loanId/early-settlement/quote`
  - Auth: user; requires verified phone.
  - Validates eligibility + lock‑in; returns quote breakdown and UI copy.
- POST `/api/loans/:loanId/early-settlement/request`
  - Auth: user; creates `wallet_transactions` PENDING with metadata; returns confirmation payload.
- Admin
  - GET `/api/admin/loans/early-settlement/pending` – list with filters.
  - POST `/api/admin/loans/early-settlement/:id/approve` – approves, posts accounting, updates loan + repayments, generates receipt.
  - POST `/api/admin/loans/early-settlement/:id/reject` – rejects with reason; no schedule changes.

## Backend Logic (High Level)
1. Eligibility & Quotes
   - Load settings. If `EARLY_SETTLEMENT_ENABLED=false`, 403.
   - Enforce lock‑in: `now < disbursedAt + lockInMonths` -> 400 with user‑friendly message.
   - Compute `remainingPrincipal` from `loan.outstandingBalance` (trust source) or sum of remaining principal portions from `loan_repayments` where `status != PAID`.
   - Compute `remainingInterest` as sum of future `interestAmount` for unpaid schedule rows (>= today).
   - `discountAmount = remainingInterest * discountFactor`.
   - `feeAmount = feeType == PERCENT ? remainingPrincipal * feeValue/100 : feeValue`.
   - `lateFeesAmount = includeLateFees ? accruedUnpaidLateFees(loanId) : 0`.
   - `totalSettlement = remainingPrincipal - discountAmount + feeAmount + lateFeesAmount`.
   - Return full breakdown.
2. Request & Approval Flow
   - Request creates PENDING wallet transaction (`type: EARLY_SETTLEMENT`, `amount = totalSettlement`, metadata = quote breakdown + loan snapshot ids, no schedule change).
   - Approve:
     - Mark transaction APPROVED with `processedAt`.
     - Settle remaining schedule:
       - Mark all unpaid `loan_repayments` as PAID with `paidAt=now()` and `actualAmount` according to remaining principal/interest allocation (or zero out by closing the loan; record a consolidated final repayment receipt using `PaymentReceipt`).
       - Update `loan.outstandingBalance = 0`, `status = DISCHARGED`, `dischargedAt = now()`.
       - Persist a `PaymentReceipt` summarizing early settlement (company info from `CompanySettings`).
       - Record a `LoanApplicationHistory` or audit log entry (optional).
     - Notify user via WhatsApp template: Early Settlement Approved.
   - Reject:
     - Mark transaction REJECTED; add `metadata.reason`.
     - No schedule changes required; nothing to revert as we didn’t mutate schedule pre‑approval.

## Frontend – User Dashboard
- Loans page payment modal
  - Replace “Full Balance” button with “Settle Early” when eligible (feature enabled + lock‑in passed).
  - On click: call `quote` API, render an “Early Settlement” sheet with:
    - Amount breakdown (principal, interest discount, fee, late fees, total).
    - Lock‑in message when blocked (includes unlock date).
    - Confirm Request -> calls `request` API, shows success state (“Pending admin approval”).
  - While a PENDING early settlement exists, disable repeat requests and show status in the loan card.

## Frontend – Admin Dashboard
- Payments page (existing)
  - Add filter “Type = Early Settlement”.
  - Detail panel shows quote breakdown and final payable.
  - Approve -> confirmation modal; triggers admin API approve.
  - Reject -> confirmation modal with reason; triggers admin API reject.
- Settings page
  - New section “Early Settlement” with the keys above. Write via `/api/admin/settings` using existing `system_settings` plumbing.

## Edge Cases & Validations
- Partial payments or overdue states:
  - Include unpaid late fees if configured; ensure amounts > 0.
  - If schedule contains past‑due items, user must clear or include them in early settlement (configurable; default include via lateFeesAmount).
- Race conditions:
  - Block multiple concurrent PENDING early settlement transactions for the same loan.
  - Re‑quote on approval is not required if we lock amounts at request time (amount stored in metadata).
- Timezone:
  - Use MYT (UTC+8) for date comparisons (consistent with existing cron logic).
- Rounding:
  - Round at the end to 2 dp; display consistent UI values.

## Notifications & Receipts
- WhatsApp messages on approval/rejection using existing `whatsappService`.
- Generate a consolidated `PaymentReceipt` on approval (new template “Early Settlement Receipt”).

## Audit & Observability
- Use `NotificationLog` for dedup if adding messages.
- Log `LoanApplicationHistory` change: status -> DISCHARGED (approved).
- WalletTransaction metadata holds full quote for reproducibility.

## Rollback Strategy
- Because we do not mutate schedule until admin approval, rejection requires no schedule revert.
- If later we support instant auto‑approve, add a snapshot step before mutating schedule and a reversal path using that snapshot.

## Testing Plan
- Unit tests for quote math with different settings (discount 0/various, fee fixed/percent, include/exclude late fees).
- API tests: eligibility, lock‑in enforcement, single pending request constraint.
- Admin flow tests: approve updates loan + repayments; reject leaves schedule intact.
- UI tests: modal displays correct breakdown; buttons enabled/disabled per eligibility.

## Implementation Phases
1. Settings & Admin UI (system_settings keys + admin settings UI controls).
2. Quote endpoint + modal integration (read‑only quote).
3. Request creation (PENDING wallet transaction); UI pending state.
4. Admin approve/reject endpoints + Payments page filter.
5. Approval posting logic (close loan, receipts, notifications).
6. Polish: analytics, copywriting, edge‑case handling.

## Open Questions
- Fee VAT/tax handling needed in receipt? (Use `CompanySettings.taxLabel`).
- Should discount apply to all future interest or only a configurable window?
- Do we require proof of payment upload for approval (existing flow reuse)?

