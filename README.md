# Kredit.my — Fintech Lending Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/) [![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/) [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/) [![AWS](https://img.shields.io/badge/AWS-ECS%20Fargate-FF9900?logo=amazon-aws)](https://aws.amazon.com/ecs/)

TypeScript-first lending platform for Malaysia. Consumer/SME loans, KYC, digital signing, repayments, and notifications.

---

## Quick Start (Local Development)

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### 1. Start Database & Backend

```bash
docker compose -f backend/docker-compose.dev.yml up -d
```

This starts PostgreSQL (port 5432) and the backend API (port 4001) with hot reload.

### 2. Start Frontend Apps

```bash
# Terminal 1 - Customer app
cd frontend && pnpm install && pnpm dev

# Terminal 2 - Admin dashboard
cd admin && pnpm install && pnpm dev
```

### 3. Access

| App | URL |
|-----|-----|
| Frontend | http://localhost:3000 |
| Admin | http://localhost:3002 |
| API | http://localhost:4001 |
| Swagger | http://localhost:4001/api-docs |

📖 **Full guide**: [`docs/QUICKSTART_DEV.md`](docs/QUICKSTART_DEV.md)

---

## Architecture

```
                    ┌─────────────────────────┐
                    │       Cloudflare        │
                    │   DNS + WAF + Tunnel    │
                    └─────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
       ▼                       ▼                       ▼
  app.domain             api.domain             sign.domain
 admin.domain                                    (Tunnel)
       │                       │                       │
       ▼                       ▼                       ▼
┌────────────────────────────────────┐         ┌──────────────┐
│           AWS ALB                  │         │   On-Prem    │
│       (Host-based routing)         │         │    Server    │
└────────────────────────────────────┘         └──────────────┘
       │           │           │                      │
       ▼           ▼           ▼               ┌──────┴──────┐
  Frontend      Admin      Backend             │             │
    ECS          ECS         ECS              DocuSeal    MTSA
                              │               Signing
                         RDS + S3           Orchestrator
```

**Cloud (AWS ECS Fargate):** Frontend, Admin, Backend containers + RDS PostgreSQL + S3  
**On-Premise:** DocuSeal, Signing Orchestrator, MTSA (via Cloudflare Tunnel)

---

## Project Structure

```
├── backend/          # Express API + Prisma
├── frontend/         # Customer Next.js app (port 3000)
├── admin/            # Admin Next.js app (port 3002)
├── on-prem/          # On-premise signing services
├── infra/            # Terraform for AWS
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [`docs/QUICKSTART_DEV.md`](docs/QUICKSTART_DEV.md) | Local development setup |
| [`docs/AWS_SETUP_GUIDE.md`](docs/AWS_SETUP_GUIDE.md) | AWS ECS deployment (zero to production) |
| [`docs/NEW_CLIENT_GUIDE.md`](docs/NEW_CLIENT_GUIDE.md) | New client onboarding |
| [`docs/THIRD_PARTY_INTEGRATIONS.md`](docs/THIRD_PARTY_INTEGRATIONS.md) | External services setup |
| [`backend/docs/`](backend/docs/) | Backend-specific docs |

---

## Key Features

- **Lending**: Applications, disbursements, repayments, wallets, late fees
- **KYC**: CTOS integration, document verification
- **Digital Signing**: DocuSeal + MTSA PKI signatures
- **Notifications**: WhatsApp Business + Email (Resend)
- **Admin**: Dashboard, approvals, analytics, user management

---

## Environment Setup

### Backend (`backend/.env`)
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kapital
JWT_SECRET=your-secret
```

### Frontend/Admin (`.env`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4001
```

---

## Common Commands

```bash
# Rebuild backend container
docker compose -f backend/docker-compose.dev.yml up -d --build backend

# Full restart
docker compose -f backend/docker-compose.dev.yml down && \
docker compose -f backend/docker-compose.dev.yml up -d

# Database reset
docker compose -f backend/docker-compose.dev.yml down -v && \
docker compose -f backend/docker-compose.dev.yml up -d

# Prisma Studio (DB GUI)
cd backend && pnpm prisma:studio

# View logs
docker compose -f backend/docker-compose.dev.yml logs -f backend
```

---

## Production Deployment

Deploy to AWS ECS via GitHub Actions:

```bash
git push origin main  # Triggers CI/CD
```

Manual deploy or first-time setup: See [`docs/AWS_SETUP_GUIDE.md`](docs/AWS_SETUP_GUIDE.md)

---

## Contributing

- TypeScript strict mode, functional patterns
- Use `fetchWithAdminTokenRefresh` for admin API calls
- Follow Shadcn/Tailwind + brand guide
- Use pnpm for package management

---

Made with Next.js, Node.js, Prisma, and ❤️
