# Admin API Guide

All admin endpoints require:
- Authorization: Bearer ${token}
- User role: ADMIN (checked server-side)

Base URL: `http://localhost:4001`

Note: Always include Authorization headers for admin API calls.

## Late Fees Administration
Routes under `GET/POST /api/admin/late-fees` in `backend/src/api/admin/late-fees.ts`.

- GET `/api/admin/late-fees`
  - Returns repayments with assessed late fees, with loan/product context and computed status.

- GET `/api/admin/late-fees/status`
  - Returns latest processing status and any structured alerts.

- POST `/api/admin/late-fees/process`
  - Manually triggers processing in force mode (bypasses daily limit). Response includes stats.

- GET `/api/admin/late-fees/repayment/{repaymentId}`
  - Late fee summary for a specific repayment.

- GET `/api/admin/late-fees/repayment/{repaymentId}/total-due`
  - Original + cumulative late fees for repayment.

- POST `/api/admin/late-fees/repayment/{repaymentId}/handle-payment`
  - Allocates a payment across late fees then principal (oldest first). Body: `{ paymentAmount, paymentDate? }`.

- POST `/api/admin/late-fees/repayment/{repaymentId}/waive`
  - Manually waive outstanding late fees for the repayment. Body: `{ reason, adminUserId }`.

- GET `/api/admin/late-fees/logs?limit=10`
  - Recent processing logs.

Scheduling: Daily cron at 1:00 AM MYT (UTC+8) via node-cron executes `LateFeeProcessor.processLateFees()`.

## System Settings
Routes under `/api/settings` in `backend/src/api/settings.ts`.

- GET `/api/settings` (admin)
- GET `/api/settings/categories` (admin)
- GET `/api/settings/{key}` (auth)
- PUT `/api/settings` (admin) — bulk update: `{ settings: [{ key, value }] }`
- PUT `/api/settings/{key}` (admin) — update single setting: `{ value }`

Settings are stored in `system_settings` with JSON-serialized `value` and optional `options` for enums.

## Bank Accounts (Payout Accounts)
Defined in `backend/src/api/bank-accounts.ts`.

- GET `/api/bank-accounts/default` (public)
  - Returns default active bank account; falls back to newest active if no default.

Admin management under `/api/bank-accounts` (guarded by admin middleware):
- GET `/api/bank-accounts` (admin)
- POST `/api/bank-accounts` (admin)
- PUT `/api/bank-accounts/{id}` (admin)
- DELETE `/api/bank-accounts/{id}` (admin)
- POST `/api/bank-accounts/{id}/set-default` (admin)

## Admin Authentication

Admin routes rely on the same JWT as users plus role check:
- Header: `Authorization: Bearer ${token}`
- Role required: `ADMIN`

See `backend/src/middleware/auth.ts` and admin role checks in each admin handler.

 