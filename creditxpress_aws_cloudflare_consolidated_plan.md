# CreditXpress: DO Droplet ➜ AWS ECS Fargate + RDS + S3 + Cloudflare Tunnel (Consolidated Plan)

This plan is tailored to **your current repo layout**:

- `backend/` (Express + Prisma)
- `frontend/` (Next.js user app)
- `admin/` (Next.js admin app)
- `on-prem/`:
  - `docuseal/` (DocuSeal + its own Postgres + nginx)
  - `signing-orchestrator/` (Express service on port 4010)
  - `mtsa/` (Tomcat webapps on port 8080)

It also reflects how you currently run things on the DigitalOcean droplet:
- A single host running everything + nginx routing.
- **Local-disk uploads** under `backend/uploads/` served via `/uploads/...`.
- `sign.*` exposed via **VPS nginx ➜ Tailscale ➜ on-prem**, with path routing to DocuSeal vs signing-orchestrator.

---

## 0) Executive recommendation (cheapest + maintainable long-term)

**Cloud:**
- Move the core platform to **AWS ECS Fargate** (3 services: `frontend`, `admin`, `backend`) behind **one ALB**.
- Move DB to **RDS Postgres**.
- Move file storage from container disk to **S3** (optionally fronted by Cloudflare CDN; access via presigned URLs).

**On-prem:**
- Keep **DocuSeal + signing-orchestrator + MTSA Tomcat** on-prem (as you requested).
- Replace Tailscale with **Cloudflare Tunnel (cloudflared)** running on-prem.
- Use **Cloudflare Tunnel ingress rules (host + path)** to replicate your old VPS nginx routing for `sign.*`.

**Standardization for future client forks:**
- Codify infra with **Terraform or AWS CDK** + per-client config (`client_slug`, `domains`, `secrets`, `rds_identifier`, `s3_bucket`).
- Standardize on-prem with a **single docker-compose template** + per-client `.env`.

---

## 1) Current state (confirmed from codebase)

### 1.1 App services
- **Backend**: Express app mounts routes under `/api/*`. It serves uploaded files via:
  - `app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))`
  - Upload endpoints use `multer.diskStorage({ destination: "uploads/" })`.
- **Frontend/Admin**: Next.js apps with `NEXT_PUBLIC_API_URL` usage.

### 1.2 Signing (on-prem) integration
Your droplet nginx config shows `sign.creditxpress.com.my` routing like:
- `/api/templates`, `/api/submissions`, etc ➜ DocuSeal (on-prem) on port `3001`
- `/api/*` ➜ signing-orchestrator (on-prem) on port `4010`
- `/` ➜ DocuSeal UI (on-prem)

Your backend contains:
- `SIGNING_ORCHESTRATOR_URL` default `https://sign.creditxpress.com.my`
- calls like `${SIGNING_ORCHESTRATOR_URL}/api/...`

Your frontend contains Next.js API routes under `frontend/app/api/mtsa/*` which also call the orchestrator, but **their URL expectation differs** (see Gotchas section).

---

## 2) Target architecture (AWS + Cloudflare)

### 2.1 High-level diagram

```mermaid
flowchart LR
  U[Users / Admins] --> CF[Cloudflare DNS + Proxy/WAF]

  CF -->|app.example.com| ALB[(AWS ALB)]
  CF -->|admin.example.com| ALB
  CF -->|api.example.com| ALB

  ALB --> FE[ECS Service: frontend (Next.js)]
  ALB --> AD[ECS Service: admin (Next.js)]
  ALB --> BE[ECS Service: backend (Express)]

  BE --> RDS[(RDS Postgres)]
  BE --> S3[(S3: uploads + generated PDFs)]

  %% signing on-prem
  CF -->|sign.example.com| TUN[Cloudflare Tunnel\ncloudflared on-prem]
  TUN --> DS[On-prem: DocuSeal (UI + API)]
  TUN --> SO[On-prem: signing-orchestrator]
  TUN --> MTSA[On-prem: Tomcat MTSA]
```

### 2.2 What Cloudflare does vs AWS does

**Cloudflare**
- DNS authoritative (or at least proxied) for your domain(s)
- HTTP proxy/WAF/caching for `app/admin/api`
- `sign.*` routed to on-prem via Tunnel (no public IP, no inbound firewall rules required)

**AWS**
- ALB performs host-based routing to ECS services
- ECS runs your containers
- RDS hosts Postgres
- S3 stores files

> You can still keep domain registration in Route 53 if you want, but DNS hosting can be Cloudflare. ACM validation records can be placed in Cloudflare DNS.

---

## 3) AWS buildout plan (minimal cost but production-viable)

### 3.1 VPC / networking (cost-aware)
Cheapest maintainable baseline:

- 2 public subnets (2 AZs) for ALB
- ECS tasks can run in public subnets with **public IPs disabled** OR enabled (see note below)
- RDS in private subnets
- **Avoid NAT Gateway** if possible (NAT is often the “silent bill”)

**Two ways to avoid NAT:**
1) Put ECS tasks in public subnets **with public IPs enabled** and lock inbound to ALB SG only.  
2) Keep tasks private but use **VPC endpoints** (S3 gateway endpoint at minimum) + accept NAT for other outbound (more secure but more expensive).

For early-stage cost control: start with (1) and revisit once traffic/requirements justify private-only.

### 3.2 ECS services (recommended)
Create 3 ECS services (Fargate):

- `creditxpress-backend`
- `creditxpress-frontend`
- `creditxpress-admin`

Each as its own task definition + service so you can scale independently.

**ALB rules (host-based):**
- `api.<domain>` ➜ backend target group
- `app.<domain>` ➜ frontend target group
- `admin.<domain>` ➜ admin target group

### 3.3 RDS Postgres
- Start with single-AZ, burstable instance (t4g.*) for cost
- Enable automated backups (short retention)
- Turn on storage autoscaling
- Put in private subnets; allow inbound only from backend security group

### 3.4 S3 for files (replaces `/uploads` on container disk)
Create an S3 bucket per environment (and optionally per client):

- `creditxpress-<client>-<env>-files`

Recommended settings:
- Block Public Access = ON
- SSE-S3 or SSE-KMS
- Lifecycle policy (move older objects to cheaper storage if needed)

Access pattern:
- Backend uploads to S3 (server-side)
- Frontend retrieves via backend-generated **presigned GET URL** OR via a signed CloudFront/Cloudflare URL

---

## 4) Cloudflare Tunnel plan (replaces Tailscale)

### 4.1 Key idea
Instead of:
- VPS nginx ➜ Tailscale ➜ on-prem services

You will do:
- **Cloudflare edge ➜ Cloudflare Tunnel ➜ on-prem services**

On-prem only needs **outbound** connectivity to Cloudflare.

### 4.2 On-prem tunnel routing (match your existing `sign.*` behavior)

Goal: `https://sign.<domain>` behaves like it did on the droplet.

Use **one hostname (`sign.<domain>`)** with path routing:

- `/api/templates*`, `/api/submissions*`, `/api/...docuseal...` ➜ DocuSeal (port 3001 or 443 on docuseal-nginx)
- `/api/*` (everything else) ➜ signing-orchestrator (port 4010, mounted at `/api`)
- `/` ➜ DocuSeal UI

Example cloudflared ingress logic (conceptual):

```yaml
ingress:
  - hostname: sign.example.com
    path: /api/templates*
    service: http://localhost:3001
  - hostname: sign.example.com
    path: /api/submissions*
    service: http://localhost:3001
  - hostname: sign.example.com
    path: /api/attachment*
    service: http://localhost:3001
  - hostname: sign.example.com
    path: /api/signing*
    service: http://localhost:3001
  - hostname: sign.example.com
    path: /api/*
    service: http://localhost:4010
  - hostname: sign.example.com
    service: http://localhost:3001
  - service: http_status:404
```

> You can point DocuSeal to `http://localhost:3001` (DocuSeal app) or to the bundled `docuseal-nginx` if you prefer.

### 4.3 Security posture
- Your signing-orchestrator already uses an API key middleware.
- Optionally add Cloudflare Access in front of sensitive endpoints, but **DocuSeal UI may need to be public** for end users, so keep Access optional or apply it only to admin-only paths.

---

## 5) Containerization changes required (because droplet ran “everything together”)

### 5.1 Backend container: ready
You already have:
- `backend/Dockerfile.prod`
- `backend/docker-compose.prod.yml` (postgres + backend)

For ECS:
- Build backend image ➜ ECR
- Configure env vars in ECS task definition (use Secrets Manager / SSM for secrets)

### 5.2 Frontend/Admin containers: add Dockerfiles
There are no Dockerfiles for `frontend/` and `admin/` in the repo today.

Recommended approach for cost + speed:
- Build Next.js in **standalone** mode
- Use minimal Node runtime image

Result:
- 1 container per Next.js app.

> Optional cost-saving alternative (later): move frontends to S3/CloudFront or Cloudflare Pages if they are effectively “static + API calls”.

---

## 6) Codebase-specific gotchas & required fixes

### 6.1 File storage: `/uploads/...` must be replaced with S3
**Where it’s currently implemented**
- `backend/src/app.ts` serves `"/uploads"` from local disk.
- `backend/src/api/loan-applications.ts` stores `fileUrl: "/uploads/<filename>"` in DB.
- Other upload flows also write to `uploads/`.

**Impact**
- In ECS Fargate, local disk is ephemeral and not shared across tasks. You will lose files on redeploy/scale.

**Required change**
- Switch uploads to S3:
  - Use `multer.memoryStorage()` + `PutObject` to S3
  - Store **S3 object key** in DB (recommended)
  - Generate presigned URLs for downloads (or return Cloudflare-cached URL if you publish via CDN)

**DB schema impact**
- Keep existing URL fields, but reinterpret them:
  - `fileUrl` becomes `s3://bucket/key` or `key` (preferred)
  - Add `storageProvider` + `bucket` + `key` if you want clean normalization later

### 6.2 Inconsistent `SIGNING_ORCHESTRATOR_URL` expectations (backend vs frontend)
- Backend expects base like `https://sign.example.com` and appends `/api/...`.
- Frontend Next.js API routes call `${SIGNING_ORCHESTRATOR_URL}/otp` and appear to expect the base already includes `/api`.

**Fix options**
1) **Best**: route all signing calls through backend only; remove/stop using frontend `/app/api/mtsa/*` proxies.
2) Or standardize:
   - Define `SIGNING_ORCHESTRATOR_API_BASE_URL` (always includes `/api`)
   - Update both backend and frontend to use the same convention.

### 6.3 CORS, cookies, and subdomains
Once you split into subdomains:
- `app.<domain>`
- `admin.<domain>`
- `api.<domain>`
- `sign.<domain>`

Make sure:
- Backend `CORS_ORIGIN` is set to allow `app` + `admin` origins.
- If you use cookies across subdomains, set `Domain=.example.com` and appropriate `SameSite`/`Secure` rules.
- If mobile app / external app calls API directly, ensure CORS + auth headers are correct.

### 6.4 Cloudflare proxy headers & body size
- Your current nginx had `client_max_body_size 100M`.
- Ensure Cloudflare + ALB + backend accept your largest payloads (PDFs, uploads).
- Ensure backend trusts proxy headers correctly (e.g., `X-Forwarded-For`) for logging/audit.

### 6.5 Internal URLs / redirects
Any absolute URLs in the frontend or backend must be updated:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `BASE_URL`, `BACKEND_URL`, `FRONTEND_URL`, etc.

---

## 7) Migration runbook (phased, low-risk)

### Phase A — Prepare AWS foundations
1. Create ECR repos for: backend, frontend, admin
2. Create VPC + subnets + security groups
3. Create ALB + HTTPS listener + host rules
4. Create RDS Postgres and parameter group
5. Create S3 bucket(s) for files
6. Create IAM roles:
   - ECS task role (S3 access, secrets read)
   - ECS execution role (pull images, logs)

### Phase B — Containerize + deploy services
1. Backend:
   - Build/push image
   - Deploy ECS service
   - Connect to RDS
2. Frontend/admin:
   - Add Dockerfiles
   - Build/push images
   - Deploy ECS services
3. Validate:
   - ALB routes
   - health checks
   - logs

### Phase C — Storage migration (local disk ➜ S3)
1. Implement S3 upload path in backend
2. Add a temporary “dual read” compatibility:
   - If `fileUrl` starts with `/uploads`, serve legacy path (only during migration)
   - If `fileUrl` is S3 key, use presigned URL
3. Copy historical files:
   - From droplet `uploads/` ➜ S3 (preserve folder structure)
   - Update DB rows to point to S3 keys

### Phase D — Signing cutover (Tailscale ➜ Cloudflare Tunnel)
1. On-prem:
   - Deploy cloudflared (as a service/container)
   - Configure ingress rules for `sign.<domain>`
   - Ensure DocuSeal + orchestrator reachable locally
2. Cloudflare:
   - Create tunnel + route hostname
   - Validate `https://sign.<domain>` behaviors
3. Update backend env:
   - `SIGNING_ORCHESTRATOR_URL=https://sign.<domain>`
   - `DOCUSEAL_API_URL` if you call DocuSeal directly (or just use sign host)

### Phase E — DNS cutover
1. Point Cloudflare records:
   - `api` proxied to ALB
   - `app` proxied to ALB
   - `admin` proxied to ALB
   - `sign` routed to Tunnel
2. Keep droplet online as rollback for 24–72 hours
3. Turn on monitoring/alerts

---

## 8) Future client forks: standardization blueprint

### 8.1 Recommended tenancy model
For ease of duplication + clean isolation:
- **One AWS account per client** (best isolation, clean billing)
- Or one account + separate stacks per client (cheaper, but isolation weaker)

On-prem:
- Either one shared on-prem server hosting multiple “client stacks”, or one on-prem server per client (depends on your business model).

### 8.2 What to templatize
- Terraform/CDK modules:
  - VPC + ALB + ECS + RDS + S3
  - CloudWatch logs/alarms
  - IAM roles
- CI/CD:
  - GitHub Actions workflows parameterized by client/env
- App config:
  - `.env` templates per service
  - a “client manifest” file (domains, bucket names, IDs)

### 8.3 “Golden paths” for low ops
- One ALB per client
- One ECS cluster per client (or per env)
- One RDS per client (or shared only if you accept risk)
- One S3 bucket per client (per env)

---

## 9) Concrete improvements to your repo (recommended)

1) **Add Dockerfiles** for `frontend/` and `admin/` (ECS-ready).
2) **Normalize signing env vars** and remove duplication:
   - Prefer backend as the only service that knows the signing API key.
3) Implement **S3 storage module** in backend:
   - central helper `storage.ts` with `putObject/getPresignedUrl`
4) Add `/health` endpoint in backend for ALB health checks if not already present.
5) Add an “infra/” folder with Terraform/CDK (per-client modules).

---

## 10) Reference (for your implementation notes)

```text
Cloudflare Tunnel supports locally-managed ingress rules and matching by hostname (and optionally path),
and Cloudflare has stated tunnels are available at no cost for the secure outbound-only connection feature.
See:
- Cloudflare One docs: Tunnel configuration + ingress rules
- Cloudflare blog: “Free Tunnels for Everyone”
```

---

## Quick confirmation
✅ I was able to open and review your uploaded zip (`creditxpress-main.zip`) and validate the plan against your current structure and routing patterns.

If you want, I can also generate a **per-service env var checklist** (backend vs frontend vs admin vs on-prem) directly from what your code references.
