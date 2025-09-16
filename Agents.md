# Kredit Platform Reference

## Platform Overview
- Digital lending product for Malaysia offering consumer/SME loans, onboarding, repayments, wallets, notifications, and signing workflows.
- Monorepo holds three user-facing apps (customer Next.js app in `frontend`, admin Next.js app in `admin`, Express backend in `backend`) plus on-prem services and infra scripts.
- Cloud stack runs on a VPS (reverse-proxied by nginx) with Docker Compose for the backend/Postgres/KYC helpers; on-premises stack hosts DocuSeal, Signing Orchestrator, and MTSA inside separate Docker networks reachable via Tailscale.

## Runtime & Deployment Notes
- Backend containers defined in `backend/docker-compose.*` and expose port 4001; Postgres 16 stores primary data, volumes mounted for `uploads/` and `receipts/`.
- Frontend/admin apps are Next.js App Router builds; production served via pm2 scripts (`frontend`, `admin`). Environment variables provide `NEXT_PUBLIC_API_URL` pointing at backend.
- On-prem Signing Orchestrator (`on-prem/signing-orchestrator`) is an Express service on port 4010 bridging DocuSeal webhooks and MyTrustSigner SOAP endpoints; maintains its own Postgres (`agreements_db`) for agreement audit/history and persists signed PDFs to mounted volumes.
- DocuSeal on-prem listens behind nginx; orchestrator communicates internally over docker networks, external traffic tunnels over Tailscale from VPS (`sign.kredit.my`).

## Backend API Architecture (`backend/src`)
- `app.ts` wires Express middleware (CORS, JSON, swagger, health check) and registers routers under `/api/*` (auth, onboarding, products, loan-applications, loans, admin, wallet, notifications, settings, KYC, bank-accounts, docuseal, mtsa, pki, ctos).
- Middleware: `authenticateToken`, `requirePhoneVerification`, and combined `authenticateAndVerifyPhone`; KYC endpoints accept one-time signed tokens via `authenticateKycOrAuth`.
- Admin RBAC handled via `lib/permissions.ts` (roles ADMIN/ATTESTOR/USER, permission matrix) with helpers `requireRole`, `requirePermission`, `requireAdminOrAttestor` used inside `api/admin` subroutes.
- Data access primarily through Prisma client (`lib/prisma`). Individual routers follow Express patterns: validate input, call Prisma, optionally coordinate with services (WhatsApp, DocuSeal, Signing Orchestrator, CTOS) and return JSON.
- File uploads handled via Multer (e.g., `loan-applications` for document uploads, `admin/receipts` for CSV imports). Static `uploads/` directory exposed via Express.
- Integrations encapsulated under `lib/`: `docusealService` builds submissions, enforces Malay wording/number formatting, manages signatory metadata; `ctosService`, `whatsappService`, `otpUtils`, `lateFeeProcessor`, `upcomingPaymentProcessor`, `receiptService` etc. Cron scheduler (`lib/cronScheduler`) starts at boot and schedules late-fee and payment-notification jobs in MYT (UTC+8).
- External dependencies: WhatsApp Business API (messages via Graph API), CTOS eKYC services, optional Python FastAPI microservices for OCR/Face/Liveness (`backend/docker-compose.dev.yml`).

## Backend Database Model (Prisma `backend/prisma/schema.prisma`)
- Core entities: `User` (contact, KYC status, auth fields), `Product` (loan terms/fees), `LoanApplication` (status progression, offer history, attestation metadata), `Loan` (financial details, DocuSeal fields, relationships to `LoanRepayment`, `LateFee`, `LoanSignatory`).
- Financial tracking: `Wallet` + `WalletTransaction`, `LoanRepayment` (supports partial payments, late fee accounting), `PaymentReceipt`, `LoanDisbursement`.
- Compliance & KYC: `UserDocument`, `KycSession` + `KycDocument`, `PhoneVerification`, `PhoneChangeRequest`.
- Notifications: `NotificationTemplate`, `Notification`, `NotificationGroup`, `NotificationLog`.
- Settings & control tables: `SystemSettings` (feature toggles/config), `CompanySettings`, `BankAccount`.
- Late fee support via `LateFee` and `LateFeeProcessingLog`.
- Signing metadata: `LoanSignatory` tracks borrower/company/witness DocuSeal status per loan.

## Frontend Customer App (`frontend`)
- Next.js App Router with hybrid server/client components; uses Shadcn UI/Tailwind.
- Authentication managed via cookies (`token`, etc.). `lib/apiUtils.ts` centralizes backend URL building (`getApiUrl`) and provides `fetchApi`/`fetchAuthApi` wrappers.
- Server actions/Next API routes under `app/api` act as thin proxies to backend endpoints, automatically attaching cookies/headers (e.g., `app/api/loan-applications/route.ts` reads `token`, forwards to backend).
- Client pages (e.g., `app/dashboard/*`) rely on hooks/components that consume backend JSON and display application statuses, KYC progress, wallets, etc. Some pages simply redirect to canonical tabs (see applications redirect example).

## Admin Panel (`admin`)
- Also Next.js App Router with Tailwind UI components (`app/components/AdminLayout.tsx` wraps navigation & permissions gating).
- Token storage via `lib/authUtils.ts` using both `localStorage` and cookies; `fetchWithAdminTokenRefresh` automatically refreshes access tokens through admin API route proxies when 401/403 occurs.
- Permissions mirrored on frontend via `admin/lib/permissions.ts` to show/hide navigation items based on backend-provided role/permission set.
- Next API routes in `admin/app/api/admin/*` forward requests to backend `/api/admin/*`, passing Authorization headers, and support features like profile edit, settings, KYC admin operations, MTSA dashboards, etc.

## On-Prem Signing Stack
- **Signing Orchestrator (`on-prem/signing-orchestrator`)**: Express server with security middlewares (Helmet, rate limiting, correlation IDs). Routes grouped under `/webhooks` (DocuSeal events), `/api` (manual sign/enroll/OTP/verify/cert info, file upload), `/health`.
  - Uses `services/SigningService.ts` for orchestrating DocuSeal downloads, calling `services/MTSAClient.ts` SOAP operations, storing output via `utils/storage`. API key auth via `X-API-Key`. Logs correlated per request.
  - Prisma schema (`on-prem/signing-orchestrator/prisma/schema.prisma`) stores agreement lifecycle (`SignedAgreement`, `AgreementDownload`, `AgreementUpload`, `AgreementAuditLog`, etc.) separate from main DB.
  - Docker compose wires service with dedicated Postgres (`agreements_db`), persistent volumes for original/signed/stamped PDFs, and environment variables for DocuSeal & MTSA credentials.
- **DocuSeal**: Config under `on-prem/docuseal` (compose, env files, nginx proxy). Accepts packets/templates, triggers webhooks to orchestrator.
- **MTSA**: SOAP services packaged under `on-prem/mtsa` (agent distribution). Signing Orchestrator chooses pilot/prod WSDL based on env; handles OTP requests and certificate enrollment.
- Backend (cloud) communicates with orchestrator via `SIGNING_ORCHESTRATOR_URL` + `SIGNING_ORCHESTRATOR_API_KEY` when serving MTSA/PKI endpoints (see `backend/src/api/mtsa.ts`, `pki.ts`); frontend surfaces flows for OTP/certificate retrieval.

## Document Signing Flow (High Level)
1. Loan/application marked for signing triggers backend DocuSeal service (`/api/docuseal/*`) to create submission with borrower/company/witness roles and Malay text helpers.
2. DocuSeal sends webhook to signing orchestrator upon signer submission; orchestrator downloads unsigned PDF, invokes MTSA to apply digital signature (OTP via `MTSAClient` if required), stores signed file and updates local DB.
3. Backend polls/fetches orchestrator via `/api/mtsa` or `/api/pki` endpoints to expose signing status to admin/frontend, and updates `Loan`/`LoanSignatory` tables accordingly. Final stamped documents uploaded by admins tracked in orchestrator DB.

## KYC & Compliance
- Backend can run optional OCR/Face/Liveness microservices (Docker) and toggles via `KYC_DOCKER`/`KYC_JWT_SECRET`. `KycSession` tracks CTOS onboarding integration; CTOS endpoints in `src/api/ctos.ts` and `src/api/admin/kyc` manage statuses.
- KYC Next.js routes and API proxies exist in both frontend and admin to submit documents and review statuses. Files stored under `/uploads` and linked to `UserDocument`/`KycDocument`.

## Notifications & Cron Jobs
- `lib/whatsappService.ts` sends WhatsApp templates (OTP, utility messages) if `ENABLE_WHATSAPP_NOTIFICATIONS` in `SystemSettings` is true; logs errors and stores message IDs.
- `lib/upcomingPaymentProcessor.ts` and `lib/lateFeeProcessor.ts` run inside cron to calculate late fees, send reminders, and persist logs (`LateFeeProcessingLog`). Schedules configured via `SystemSettings` and run in UTC but aligned to MYT.

## Key Environment Variables
- Backend `.env`: local development overrides (DB credentials, JWT secrets, CTOS keys, DocuSeal & Signing Orchestrator URLs/API keys, WhatsApp tokens, timezone).
- Backend `.env.example`: source of truth for production secrets; copied into GitHub Actions/VPS/On-prem deployments.
- Frontend/Admin `.env`: local dev settings (e.g., `NEXT_PUBLIC_API_URL`, feature flags).
- Frontend/Admin `.env_example`: production values synced to secrets before deployment.
- Signing Orchestrator envs: DocuSeal tokens, MTSA SOAP credentials, API key, signed file directories, DB password.

## Quick Interaction Map
- Frontend/Admin → Next API proxy (`app/api/*`) → Backend Express REST → Prisma/Postgres & integrations.
- Backend → DocuSeal (REST) + Signing Orchestrator (REST with API key) → DocuSeal webhooks → Signing Orchestrator → MTSA (SOAP) → Files + orchestrator Postgres.
- Backend → WhatsApp Graph API, CTOS API, optional Python microservices.

Keep this document updated when flows change so future prompts have accurate context.
