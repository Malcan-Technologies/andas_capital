--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: NotificationPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."NotificationPriority" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'SYSTEM',
    'MARKETING'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: WalletTransactionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WalletTransactionStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."WalletTransactionStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: late_fee_processing_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.late_fee_processing_logs (
    id text NOT NULL,
    "processedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "feesCalculated" integer DEFAULT 0 NOT NULL,
    "totalFeeAmount" double precision DEFAULT 0 NOT NULL,
    overdue_repayments integer DEFAULT 0 NOT NULL,
    status text NOT NULL,
    "errorMessage" text,
    "processingTimeMs" integer,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.late_fee_processing_logs OWNER TO postgres;

--
-- Name: late_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.late_fees (
    id text NOT NULL,
    "loanRepaymentId" text NOT NULL,
    "calculationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "daysOverdue" integer NOT NULL,
    "outstandingPrincipal" double precision NOT NULL,
    "dailyRate" double precision NOT NULL,
    "feeAmount" double precision NOT NULL,
    "cumulativeFees" double precision NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "feeType" text DEFAULT 'INTEREST'::text NOT NULL,
    "fixedFeeAmount" double precision,
    "frequencyDays" integer
);


ALTER TABLE public.late_fees OWNER TO postgres;

--
-- Name: loan_application_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_application_history (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "previousStatus" text,
    "newStatus" text NOT NULL,
    "changedBy" text NOT NULL,
    "changeReason" text,
    notes text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.loan_application_history OWNER TO postgres;

--
-- Name: loan_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_applications (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    amount double precision,
    term integer,
    status text DEFAULT 'INCOMPLETE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "acceptTerms" boolean DEFAULT false NOT NULL,
    "appStep" integer DEFAULT 0 NOT NULL,
    "applicationFee" double precision,
    "interestRate" double precision,
    "lateFee" double precision,
    "legalFee" double precision,
    "monthlyRepayment" double precision,
    "netDisbursement" double precision,
    "originationFee" double precision,
    "paidAppFee" boolean DEFAULT false NOT NULL,
    purpose text,
    "urlLink" text
);


ALTER TABLE public.loan_applications OWNER TO postgres;

--
-- Name: loan_disbursements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_disbursements (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "referenceNumber" text NOT NULL,
    amount double precision NOT NULL,
    "bankName" text,
    "bankAccountNumber" text,
    "disbursedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "disbursedBy" text NOT NULL,
    notes text,
    status text DEFAULT 'COMPLETED'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.loan_disbursements OWNER TO postgres;

--
-- Name: loan_repayments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loan_repayments (
    id text NOT NULL,
    "loanId" text NOT NULL,
    amount double precision NOT NULL,
    "principalAmount" double precision NOT NULL,
    "interestAmount" double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "actualAmount" double precision,
    "daysEarly" integer DEFAULT 0,
    "daysLate" integer DEFAULT 0,
    "installmentNumber" integer,
    "parentRepaymentId" text,
    "paymentType" text,
    "scheduledAmount" double precision
);


ALTER TABLE public.loan_repayments OWNER TO postgres;

--
-- Name: loans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loans (
    id text NOT NULL,
    "userId" text NOT NULL,
    "applicationId" text NOT NULL,
    "principalAmount" double precision NOT NULL,
    "outstandingBalance" double precision NOT NULL,
    "interestRate" double precision NOT NULL,
    term integer NOT NULL,
    "monthlyPayment" double precision NOT NULL,
    "nextPaymentDue" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "disbursedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dischargedAt" timestamp(3) without time zone,
    "totalAmount" double precision NOT NULL
);


ALTER TABLE public.loans OWNER TO postgres;

--
-- Name: notification_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_groups (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    filters jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_groups OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    metadata jsonb,
    priority public."NotificationPriority" DEFAULT 'LOW'::public."NotificationPriority" NOT NULL,
    "templateId" text,
    type public."NotificationType" NOT NULL,
    link text
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "minAmount" double precision NOT NULL,
    "maxAmount" double precision NOT NULL,
    "repaymentTerms" jsonb NOT NULL,
    "interestRate" double precision NOT NULL,
    eligibility jsonb[],
    "originationFee" double precision NOT NULL,
    "legalFee" double precision NOT NULL,
    "applicationFee" double precision NOT NULL,
    "requiredDocuments" jsonb[],
    features jsonb[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "loanTypes" jsonb[],
    "lateFeeFixedAmount" double precision DEFAULT 0 NOT NULL,
    "lateFeeFrequencyDays" integer DEFAULT 7 NOT NULL,
    "lateFeeRate" double precision DEFAULT 8.0 NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: user_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_documents (
    id text NOT NULL,
    "userId" text NOT NULL,
    "applicationId" text,
    type text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "fileUrl" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_documents OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    "phoneNumber" text NOT NULL,
    password text NOT NULL,
    "refreshToken" text,
    "fullName" text,
    "dateOfBirth" timestamp(3) without time zone,
    email text,
    address1 text,
    address2 text,
    city text,
    state text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    country text,
    "idExpiry" timestamp(3) without time zone,
    "idNumber" text,
    "idType" text,
    nationality text,
    role text DEFAULT 'USER'::text NOT NULL,
    "zipCode" text,
    "lastLoginAt" timestamp(3) without time zone,
    "accountNumber" text,
    "bankName" text,
    "employerName" text,
    "employmentStatus" text,
    "monthlyIncome" text,
    "isOnboardingComplete" boolean DEFAULT false NOT NULL,
    "kycStatus" boolean DEFAULT false NOT NULL,
    "onboardingStep" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_transactions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "walletId" text NOT NULL,
    "loanId" text,
    type text NOT NULL,
    amount double precision NOT NULL,
    description text NOT NULL,
    reference text,
    metadata jsonb,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."WalletTransactionStatus" DEFAULT 'PENDING'::public."WalletTransactionStatus" NOT NULL
);


ALTER TABLE public.wallet_transactions OWNER TO postgres;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    "availableForWithdrawal" double precision DEFAULT 0 NOT NULL,
    "totalDeposits" double precision DEFAULT 0 NOT NULL,
    "totalWithdrawals" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
856a9c2e-c28e-4b75-94a0-654a8a5b06c8	4f284da6e8fd9737192e8302d8e585577fa4354bce5dbe6318ae617b5e2bbc7e	2025-06-24 07:38:54.039184+00	20250404033530_migrate	\N	\N	2025-06-24 07:38:54.033675+00	1
e2afc609-4751-4bdc-befd-46e681916b5e	65ff5f43e49d5e0eaaa153c00b4fcf32992ecb242219a1b2b67acee881618e7d	2025-06-24 07:38:54.101089+00	20250610075815_add_notification_link	\N	\N	2025-06-24 07:38:54.099512+00	1
a85c3da4-f87a-4f6e-95b3-0fdf20c15cb3	ea10508c3f51ff77bd66b7fdbc13ea6f22b3df69a50ba72ad5f35bcb50c0abe7	2025-06-24 07:38:54.042844+00	20250404065123_add_kyc_and_last_login	\N	\N	2025-06-24 07:38:54.040767+00	1
3fa65bd5-9187-457c-bbc5-c52973087df4	5c67a679e2b3e2a7adf7cecf15987d6310cd1a196191061c2019a7de83ca50e6	2025-06-24 07:38:54.059192+00	20250404104106_add_products_and_roles	\N	\N	2025-06-24 07:38:54.043932+00	1
7da1179a-f16d-44aa-b22e-f57ca08dfc2f	461864a01001608d13d45c86bd57d143aae6980d520a34b39601387043162e06	\N	20250101000000_enhance_payment_tracking	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250101000000_enhance_payment_tracking\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "installmentNumber" of relation "loan_repayments" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"installmentNumber\\" of relation \\"loan_repayments\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7347), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250101000000_enhance_payment_tracking"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250101000000_enhance_payment_tracking"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	\N	2025-06-26 03:30:00.150761+00	0
d1a77123-7471-412b-a105-c1fc272aa7c4	7aa9da95daf6f898e8d832797a6e1194b9f30ee6728196ae1f5507c1d951b928	2025-06-24 07:38:54.061164+00	20250404104338_add_last_login_at	\N	\N	2025-06-24 07:38:54.059908+00	1
b2be49eb-0a8c-4327-8546-7e29fe0c0ed5	d60b6115e9f7e8b4024996995088c8caf41d376c25d5fa4b10b842eb434219e8	2025-06-24 07:38:54.105108+00	20250612083007_add_loan_application_history	\N	\N	2025-06-24 07:38:54.101765+00	1
64b64dc2-1669-4c75-9e8e-7fe6dab4e381	b02fe47d435a045ca5f935e7d628a96c7166fd758c8693c087a2483861c0349d	2025-06-24 07:38:54.063073+00	20250404104530_add_employment_fields	\N	\N	2025-06-24 07:38:54.06189+00	1
e1533478-b379-47df-b1e5-cbc5e9246ed6	c5f3eed2c5122f20c0c36c61722b983bcd39884ecf818b59cd3cde59cb732c7e	2025-06-24 07:38:54.065198+00	20250404104625_add_onboarding_fields	\N	\N	2025-06-24 07:38:54.063644+00	1
72dc70b3-8359-40cb-acfd-0158b4d74a6d	274b7e62cc1d71dc0453ac3b15b6a7d39a1a340734f41ec708a9932324146a75	2025-06-24 07:38:54.067487+00	20250404122229_add_loan_types	\N	\N	2025-06-24 07:38:54.065969+00	1
1c1fef7e-6eff-45ca-ac72-9602ae0624a3	066843c426a461e67ade32625214e98622936f63ae5230b150fd89ea6fad6ac9	2025-06-24 07:38:54.107596+00	20250612102800_add_unique_constraint_to_wallet_transaction_reference	\N	\N	2025-06-24 07:38:54.105958+00	1
3a3a8954-776e-4273-ad96-3f08851d68f9	654d49cdcbf2ae883c377e95b5c73b0c5a87f9b347ecdf3f3c7745aead11c816	2025-06-24 07:38:54.070648+00	20250405025354_add_loan_application_fields	\N	\N	2025-06-24 07:38:54.068325+00	1
df3074fd-ce6c-46e2-9b06-fa05b00f36b7	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-06-24 07:38:54.072323+00	20250405025414_add_loan_application_fields	\N	\N	2025-06-24 07:38:54.071426+00	1
4bdf4622-c2ed-4cb1-8758-0217bf107f9a	200ec844aa8921d7b0604f1d1634b0fd5cf76c22e5f27b12a74e752fe8b58f93	2025-06-24 07:38:54.074076+00	20250405034156_make_amount_and_term_optional	\N	\N	2025-06-24 07:38:54.072975+00	1
6448a561-b65d-46cc-8809-7b9fde2ece81	5d625be811b5f7998dee9eaedc4dc07d8a4f4bb829aca1229f4c6f5bd86bc4b8	2025-06-24 07:38:54.119343+00	20250624042257_add_late_fee_system	\N	\N	2025-06-24 07:38:54.108281+00	1
c00cd6ab-a320-4e63-a59c-c7888ddb1a6c	21f5efe1e8c853f13d597ce5bebb8d74fa01949df9cd0fa5d58bc83c1ab180f5	2025-06-24 07:38:54.088842+00	20250609070950_add_wallet_models	\N	\N	2025-06-24 07:38:54.074685+00	1
63c0d45f-2f70-4245-9e39-311c0c148ab1	a10697068b48041c527c98a8fd60ebf27f602b5e7430041780ca6940f96ce9ae	2025-06-24 07:38:54.091577+00	20250609080331_update_wallet_transaction_status_enum	\N	\N	2025-06-24 07:38:54.089615+00	1
00ec63c6-eff4-43b9-915c-8b27cf2c8052	f355db1f21e3460e81f7c4e29448ad227bb7fe2971381976e587ad3e153e6240	2025-06-24 07:38:54.098678+00	20250610073319_add_notification_system	\N	\N	2025-06-24 07:38:54.092307+00	1
e226e249-2b54-48ef-8648-2013de75bf63	a188b36d88830a26be7631d80618f52940e185ca2c7a7ea698ca580f34c2747a	2025-06-24 07:38:54.123775+00	20250625000000_add_loan_disbursement_table	\N	\N	2025-06-24 07:38:54.120062+00	1
dddd0603-b180-40fa-bdde-9b8befe680c8	5cb9554ed7d401d4171731e697bbceeb795c9d32afafb532f23c3228ccff8cc4	2025-06-24 08:39:02.550185+00	20250624083902_enhance_late_fee_system	\N	\N	2025-06-24 08:39:02.535408+00	1
\.


--
-- Data for Name: late_fee_processing_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.late_fee_processing_logs (id, "processedAt", "feesCalculated", "totalFeeAmount", overdue_repayments, status, "errorMessage", "processingTimeMs", metadata, "createdAt") FROM stdin;
34beba03-0af9-4a4b-af99-2504134e2995	2025-06-24 07:43:38.54	1	0.2155243835616439	1	SUCCESS	\N	16	{"dailyRate": 0.00021917808219178083, "timestamp": "2025-06-24T07:43:38.538Z", "annualRate": 0.08}	2025-06-24 07:43:38.54
26d3cb24-7389-47eb-b1f5-2feadee63f80	2025-06-24 07:50:49.152	0	0	0	SUCCESS	\N	11	{"dailyRate": 0.00021917808219178083, "timestamp": "2025-06-24T07:50:49.150Z", "annualRate": 0.08}	2025-06-24 07:50:49.152
781ccf5f-f436-4afd-a7a4-061e32a1ccae	2025-06-24 07:57:42.845	0	0	0	SUCCESS	\N	7	{"dailyRate": 0.00021917808219178083, "timestamp": "2025-06-24T07:57:42.842Z", "annualRate": 0.08}	2025-06-24 07:57:42.845
afb87498-fc6a-4189-8ecd-a9367f61f543	2025-06-24 08:49:35.671	0	0	1	SUCCESS	\N	54	{"timestamp": "2025-06-24T08:49:35.669Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:49:35.671
1ea969b4-5ce5-49f1-8cac-5e440e73b628	2025-06-24 08:50:44.52	0	0	1	SUCCESS	\N	11	{"timestamp": "2025-06-24T08:50:44.519Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:50:44.52
9988da05-3062-4bd6-bab0-e3317ae087ea	2025-06-24 08:50:56.068	0	0	1	SUCCESS	\N	41	{"timestamp": "2025-06-24T08:50:56.066Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:50:56.068
5b136bf3-99c8-4bce-ba18-9ba652fc8b5c	2025-06-24 08:51:07.219	0	0	1	SUCCESS	\N	48	{"timestamp": "2025-06-24T08:51:07.215Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:51:07.219
b7c54b78-337f-4f62-9668-f181b2b72805	2025-06-24 08:51:23.134	0	0	1	SUCCESS	\N	54	{"timestamp": "2025-06-24T08:51:23.133Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:51:23.134
02ff1a0c-dd52-4223-b991-f03dd247b2fa	2025-06-24 08:52:53.284	0	0	1	SUCCESS	\N	17	{"timestamp": "2025-06-24T08:52:53.282Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:52:53.284
774a2209-8d9b-4617-9949-fd9690a2f682	2025-06-24 08:54:18.223	1	0.98	1	SUCCESS	\N	68	{"timestamp": "2025-06-24T08:54:18.222Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:54:18.223
2941667e-dfe5-4bc4-81f8-34bfd6edb32f	2025-06-24 08:55:17.073	1	0.98	1	SUCCESS	\N	26	{"timestamp": "2025-06-24T08:55:17.071Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:55:17.073
66a32e0a-7694-44c1-9546-43cc308e4dbe	2025-06-24 08:55:37.205	0	0	1	SUCCESS	\N	10	{"timestamp": "2025-06-24T08:55:37.204Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:55:37.205
f469c6db-2032-4ee2-9db8-9ac93ceae4eb	2025-06-24 08:58:41.655	2	1000.98	1	SUCCESS	\N	33	{"timestamp": "2025-06-24T08:58:41.654Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 08:58:41.655
29bfbbf4-9e52-49f3-87f4-aabb4473f1c5	2025-06-24 09:03:55.855	2	1000.98	1	SUCCESS	\N	53	{"timestamp": "2025-06-24T09:03:55.855Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:03:55.855
634a64e8-0f37-4b4d-98f6-e9374752791f	2025-06-24 09:05:13.126	2	1030.48	1	SUCCESS	\N	70	{"timestamp": "2025-06-24T09:05:13.125Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:05:13.126
cf5ecc0b-7d93-4088-ac04-7853918767c3	2025-06-24 09:09:47.027	2	1030.48	1	SUCCESS	\N	44	{"timestamp": "2025-06-24T09:09:47.026Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:09:47.027
11677db0-d31b-4376-856e-c97fd1647fa7	2025-06-24 09:22:41.302	1	1030.48	1	SUCCESS	\N	70	{"timestamp": "2025-06-24T09:22:41.301Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:22:41.302
df1c5377-171b-4e37-a2db-cc281c9105c0	2025-06-24 09:29:36.858	1	1030.48	1	SUCCESS	\N	77	{"timestamp": "2025-06-24T09:29:36.855Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:29:36.858
3977f339-e674-4022-b461-77886491f527	2025-06-24 09:33:09.251	0	0	1	SUCCESS	\N	127	{"timestamp": "2025-06-24T09:33:09.243Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:33:09.251
8c2075e5-6f9c-45ad-b67e-6f8f9a3efb58	2025-06-24 09:36:41.393	1	779.5	1	SUCCESS	\N	68	{"timestamp": "2025-06-24T09:36:41.392Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:36:41.393
33b3a9ef-3547-4d45-8fb0-081008c7d224	2025-06-24 09:42:34.994	0	0	1	SUCCESS	\N	10	{"timestamp": "2025-06-24T09:42:34.991Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:42:34.994
160b4711-2f79-412d-9fad-de1c14a34160	2025-06-24 09:42:54.566	1	1030.48	1	SUCCESS	\N	14	{"timestamp": "2025-06-24T09:42:54.564Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:42:54.566
bfd8dfd8-57fd-4d0d-8610-c6b1760713a2	2025-06-24 09:44:59.849	0	0	1	SUCCESS	\N	77	{"timestamp": "2025-06-24T09:44:59.847Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:44:59.849
6156f8f2-5df1-4cbb-8c02-3a5098e84c02	2025-06-24 09:50:23.3	1	6.71	1	SUCCESS	\N	17	{"timestamp": "2025-06-24T09:50:23.298Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-24 09:50:23.3
81eadad2-6dda-4fd7-86bd-c5545c996ce9	2025-06-26 03:27:47.389	0	0	0	SUCCESS	\N	7	{"timestamp": "2025-06-26T03:27:47.385Z", "processingType": "enhanced_late_fee_system", "supportsFeeTypes": ["INTEREST", "FIXED"]}	2025-06-26 03:27:47.389
\.


--
-- Data for Name: late_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.late_fees (id, "loanRepaymentId", "calculationDate", "daysOverdue", "outstandingPrincipal", "dailyRate", "feeAmount", "cumulativeFees", status, "createdAt", "updatedAt", "feeType", "fixedFeeAmount", "frequencyDays") FROM stdin;
a0b03fde-673f-4c05-911a-17075f188b1e	cmca7u2nw000d74331f3oykdi	2025-06-24 00:00:00	31	983.33	0.00022	6.71	6.71	ACTIVE	2025-06-24 09:50:23.295	2025-06-24 09:50:23.295	COMBINED	\N	\N
\.


--
-- Data for Name: loan_application_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_application_history (id, "applicationId", "previousStatus", "newStatus", "changedBy", "changeReason", notes, metadata, "createdAt") FROM stdin;
cmca7tylr00057433andjrgdn	cmca7t05j00037433qo66spil	PENDING_DISBURSEMENT	PENDING_DISBURSEMENT	cmca7s9g7000074c6islh1hk6	Admin status update		{"timestamp": "2025-06-24T07:40:15.086Z", "updatedAt": "2025-06-24T07:40:15.086Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "finalStatus": "PENDING_DISBURSEMENT", "originalStatus": "PENDING_DISBURSEMENT"}	2025-06-24 07:40:15.087
cmca7u2o2000u7433urt5vp5p	cmca7t05j00037433qo66spil	PENDING_DISBURSEMENT	ACTIVE	cmca7s9g7000074c6islh1hk6	Loan disbursement	Loan disbursed by admin	{"amount": 9500, "timestamp": "2025-06-24T07:40:20.354Z", "disbursedAt": "2025-06-24T07:40:20.354Z", "disbursedBy": "cmca7s9g7000074c6islh1hk6", "referenceNumber": "DISB-QO66SPIL-815114"}	2025-06-24 07:40:20.355
cmccron8a000geoy6gfj960mw	cmccqvasx000eeoy6esx9h2t9	PENDING_KYC	PENDING_KYC	cmca7s9g7000074c6islh1hk6	Admin status update		{"timestamp": "2025-06-26T02:31:31.737Z", "updatedAt": "2025-06-26T02:31:31.737Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "finalStatus": "PENDING_KYC", "originalStatus": "PENDING_KYC"}	2025-06-26 02:31:31.738
cmccroo8z000keoy6n2ieak3h	cmccqvasx000eeoy6esx9h2t9	PENDING_APPROVAL	PENDING_APPROVAL	cmca7s9g7000074c6islh1hk6	Admin status update		{"timestamp": "2025-06-26T02:31:33.059Z", "updatedAt": "2025-06-26T02:31:33.058Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "finalStatus": "PENDING_APPROVAL", "originalStatus": "PENDING_APPROVAL"}	2025-06-26 02:31:33.06
cmccrop6j000oeoy6ws0uuw26	cmccqvasx000eeoy6esx9h2t9	PENDING_SIGNATURE	PENDING_SIGNATURE	cmca7s9g7000074c6islh1hk6	Admin status update		{"timestamp": "2025-06-26T02:31:34.267Z", "updatedAt": "2025-06-26T02:31:34.267Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "finalStatus": "PENDING_SIGNATURE", "originalStatus": "PENDING_SIGNATURE"}	2025-06-26 02:31:34.267
cmccropza000seoy6q8enaepj	cmccqvasx000eeoy6esx9h2t9	PENDING_DISBURSEMENT	PENDING_DISBURSEMENT	cmca7s9g7000074c6islh1hk6	Admin status update		{"timestamp": "2025-06-26T02:31:35.301Z", "updatedAt": "2025-06-26T02:31:35.301Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "finalStatus": "PENDING_DISBURSEMENT", "originalStatus": "PENDING_DISBURSEMENT"}	2025-06-26 02:31:35.302
\.


--
-- Data for Name: loan_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_applications (id, "userId", "productId", amount, term, status, "createdAt", "updatedAt", "acceptTerms", "appStep", "applicationFee", "interestRate", "lateFee", "legalFee", "monthlyRepayment", "netDisbursement", "originationFee", "paidAppFee", purpose, "urlLink") FROM stdin;
cmca7t05j00037433qo66spil	cmca7s9g7000074c6islh1hk6	cmca7s9gc000174c6xc5t9whl	10000	12	ACTIVE	2025-06-24 07:39:30.439	2025-06-24 07:40:20.344	t	5	50	1.5	8	200	983.33	9500	300	f		nKjelJzfOM
cmcaacm1000022aenht55x1u5	cmca7s9g7000074c6islh1hk6	cmcaacm0s00002aenuk4m4oq1	10000	6	APPROVED	2025-06-24 08:50:44.484	2025-06-24 08:50:44.484	f	0	\N	\N	\N	\N	\N	\N	\N	f	Testing late fees	\N
cmcacqgjr00028j1i60hd3u7h	cmca7s9g7000074c6islh1hk6	cmca7s9gc000174c6xc5t9whl	\N	\N	INCOMPLETE	2025-06-24 09:57:29.799	2025-06-24 09:57:29.799	f	2	50	1.5	\N	2	\N	\N	3	f	\N	kDva7vdt_G
cmccqvasx000eeoy6esx9h2t9	cmca7s9g7000074c6islh1hk6	cmca7s9gc000274c6ogqgufst	100000	12	PENDING_DISBURSEMENT	2025-06-26 02:08:42.609	2025-06-26 02:31:35.295	t	5	50	1.5	\N	2000	9833.33	95000	3000	f	Office Equipment	YPq7-HjrFQ
cmcactoj10001eoy61hutubz4	cmca7s9g7000074c6islh1hk6	cmca7s9gc000174c6xc5t9whl	10000	12	INCOMPLETE	2025-06-24 10:00:00.11	2025-06-26 02:33:03.108	f	5	50	1.5	\N	200	983.33	9500	300	f		zaE3f_nQOz
\.


--
-- Data for Name: loan_disbursements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_disbursements (id, "applicationId", "referenceNumber", amount, "bankName", "bankAccountNumber", "disbursedAt", "disbursedBy", notes, status, "createdAt", "updatedAt") FROM stdin;
cmca7u2nu000c74339sk5m93w	cmca7t05j00037433qo66spil	DISB-QO66SPIL-815114	9500	Not provided	Not provided	2025-06-24 07:40:20.345	cmca7s9g7000074c6islh1hk6	Loan disbursed by admin	COMPLETED	2025-06-24 07:40:20.346	2025-06-24 07:40:20.346
\.


--
-- Data for Name: loan_repayments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loan_repayments (id, "loanId", amount, "principalAmount", "interestAmount", status, "dueDate", "paidAt", "createdAt", "updatedAt", "actualAmount", "daysEarly", "daysLate", "installmentNumber", "parentRepaymentId", "paymentType", "scheduledAmount") FROM stdin;
cmcaacm1900062aena8tjl9ah	cmcaacm1500042aenflscejym	2866.67	1666.67	1200	PENDING	2025-07-19 15:59:59.999	\N	2025-06-24 08:50:44.493	2025-06-24 08:50:44.493	\N	0	0	1	\N	\N	2866.67
cmcaacm1c00082aencyxeu66h	cmcaacm1500042aenflscejym	2866.67	1666.67	1200	PENDING	2025-08-14 15:59:59.999	\N	2025-06-24 08:50:44.497	2025-06-24 08:50:44.497	\N	0	0	2	\N	\N	2866.67
cmcaacm1e000a2aenugv6zbt8	cmcaacm1500042aenflscejym	2866.67	1666.67	1200	PARTIAL	2025-09-21 15:59:59.999	\N	2025-06-24 08:50:44.498	2025-06-24 08:50:44.498	2006.669	0	0	3	\N	\N	2866.67
cmcaacm1f000c2aenusulggsw	cmcaacm1500042aenflscejym	2866.67	1666.67	1200	PENDING	2025-10-29 15:59:59.999	\N	2025-06-24 08:50:44.5	2025-06-24 08:50:44.5	\N	0	0	4	\N	\N	2866.67
cmcaacm1h000e2aenllpqo5po	cmcaacm1500042aenflscejym	2866.67	1666.67	1200	PENDING	2025-11-24 15:59:59.999	\N	2025-06-24 08:50:44.501	2025-06-24 08:50:44.501	\N	0	0	5	\N	\N	2866.67
cmcaacm1k000g2aenm7mue1qt	cmcaacm1500042aenflscejym	2866.67	1666.67	1200	PENDING	2025-12-24 15:59:59.999	\N	2025-06-24 08:50:44.505	2025-06-24 08:50:44.505	\N	0	0	6	\N	\N	2866.67
cmca7u2nw000d74331f3oykdi	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	COMPLETED	2025-05-24 15:59:59.999	2025-06-25 02:01:39.147	2025-06-24 07:40:20.349	2025-06-25 02:01:39.154	983.33	0	32	1	\N	LATE	983.33
cmca7u2nw000e7433vuvrntwy	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2025-08-24 15:59:59.999	2025-06-25 02:01:39.147	2025-06-24 07:40:20.349	2025-06-25 02:01:39.156	6.709999999999923	60	0	2	\N	PARTIAL	983.33
cmca7u2nw000f7433in737jf5	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2025-09-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.157	\N	\N	\N	3	\N	\N	983.33
cmca7u2nw000g74333u2u8dmj	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2025-10-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.158	\N	\N	\N	4	\N	\N	983.33
cmca7u2nw000h7433t3bgmw13	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2025-11-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.159	\N	\N	\N	5	\N	\N	983.33
cmca7u2nx000i7433gpgo9xts	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2025-12-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.16	\N	\N	\N	6	\N	\N	983.33
cmca7u2nx000j7433hv4upc0g	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2026-01-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.161	\N	\N	\N	7	\N	\N	983.33
cmca7u2nx000k743381bb59yn	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2026-02-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.162	\N	\N	\N	8	\N	\N	983.33
cmca7u2nx000l7433wvnagw0t	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2026-03-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.163	\N	\N	\N	9	\N	\N	983.33
cmca7u2nx000m7433ddw6sy9u	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2026-04-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.164	\N	\N	\N	10	\N	\N	983.33
cmca7u2nx000n7433jm1041uv	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2026-05-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.165	\N	\N	\N	11	\N	\N	983.33
cmca7u2nx000o7433k51tnxft	cmca7u2ns000a7433dh41zfwb	983.33	833.33	150	PENDING	2026-06-24 15:59:59.999	\N	2025-06-24 07:40:20.349	2025-06-25 02:01:39.166	\N	\N	\N	12	\N	\N	983.33
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loans (id, "userId", "applicationId", "principalAmount", "outstandingBalance", "interestRate", term, "monthlyPayment", "nextPaymentDue", status, "disbursedAt", "createdAt", "updatedAt", "dischargedAt", "totalAmount") FROM stdin;
cmcaacm1500042aenflscejym	cmca7s9g7000074c6islh1hk6	cmcaacm1000022aenht55x1u5	10000	8000	12	6	2866.67	2025-07-19 15:59:59.999	ACTIVE	2025-06-24 08:50:44.488	2025-06-24 08:50:44.489	2025-06-24 08:50:44.506	\N	10800
cmca7u2ns000a7433dh41zfwb	cmca7s9g7000074c6islh1hk6	cmca7t05j00037433qo66spil	10000	10809.96	1.5	12	983.33	2025-08-24 15:59:59.999	ACTIVE	2025-06-24 07:40:20.344	2025-06-24 07:40:20.345	2025-06-25 02:01:39.171	\N	11800
\.


--
-- Data for Name: notification_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_groups (id, name, description, filters, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, code, title, message, type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", title, message, "isRead", "createdAt", "updatedAt", "expiresAt", metadata, priority, "templateId", type, link) FROM stdin;
cmca7tylu00077433zy5hze4i	cmca7s9g7000074c6islh1hk6	Application Status Updated	Your loan application status has been updated to PENDING_DISBURSEMENT	f	2025-06-24 07:40:15.09	2025-06-24 07:40:15.09	\N	{"notes": "", "newStatus": "PENDING_DISBURSEMENT", "updatedAt": "2025-06-24T07:40:15.089Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "applicationId": "cmca7t05j00037433qo66spil", "originalStatus": "PENDING_DISBURSEMENT", "previousStatus": "PENDING_DISBURSEMENT"}	HIGH	\N	SYSTEM	\N
cmcbb48f00005eoy6j7zaabeb	cmca7s9g7000074c6islh1hk6	Payment Submitted	Your loan repayment of RM 990 has been submitted and is awaiting approval.	f	2025-06-25 01:59:59.388	2025-06-25 01:59:59.388	\N	{"amount": 990.04, "loanId": "cmca7u2ns000a7433dh41zfwb", "paymentMethod": "FRESH_FUNDS", "transactionId": "cmcbb48e20003eoy61y77sj6q"}	MEDIUM	\N	SYSTEM	\N
cmcbb6deu000ceoy6sly0e3xd	cmca7s9g7000074c6islh1hk6	Payment Processed	Your loan repayment of RM 990 has been processed successfully.	f	2025-06-25 02:01:39.175	2025-06-25 02:01:39.175	\N	{"amount": 990.04, "loanId": "cmca7u2ns000a7433dh41zfwb", "paymentMethod": "WALLET_BALANCE", "transactionId": "cmcbb6de30009eoy6507zd8tb"}	MEDIUM	\N	SYSTEM	\N
cmca7u2o2000s7433slfv5yw7	cmca7s9g7000074c6islh1hk6	Loan Activated	Your loan of 9500 has been disbursed to your bank account and is now active. Reference: DISB-QO66SPIL-815114	t	2025-06-24 07:40:20.354	2025-06-25 13:19:26.57	\N	{"notes": "Loan disbursed by admin", "loanAmount": 10000, "disbursedAt": "2025-06-24T07:40:20.353Z", "disbursedBy": "cmca7s9g7000074c6islh1hk6", "referenceNumber": "DISB-QO66SPIL-815114", "disbursementAmount": 9500}	HIGH	\N	SYSTEM	\N
cmccron8c000ieoy6sh0svb1r	cmca7s9g7000074c6islh1hk6	Application Status Updated	Your loan application status has been updated to PENDING_KYC	f	2025-06-26 02:31:31.74	2025-06-26 02:31:31.74	\N	{"notes": "", "newStatus": "PENDING_KYC", "updatedAt": "2025-06-26T02:31:31.740Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "applicationId": "cmccqvasx000eeoy6esx9h2t9", "originalStatus": "PENDING_KYC", "previousStatus": "PENDING_KYC"}	HIGH	\N	SYSTEM	\N
cmccroo91000meoy6hnuo7bcn	cmca7s9g7000074c6islh1hk6	Application Status Updated	Your loan application status has been updated to PENDING_APPROVAL	f	2025-06-26 02:31:33.062	2025-06-26 02:31:33.062	\N	{"notes": "", "newStatus": "PENDING_APPROVAL", "updatedAt": "2025-06-26T02:31:33.061Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "applicationId": "cmccqvasx000eeoy6esx9h2t9", "originalStatus": "PENDING_APPROVAL", "previousStatus": "PENDING_APPROVAL"}	HIGH	\N	SYSTEM	\N
cmccrop6l000qeoy680vr3ri9	cmca7s9g7000074c6islh1hk6	Application Status Updated	Your loan application status has been updated to PENDING_SIGNATURE	f	2025-06-26 02:31:34.269	2025-06-26 02:31:34.269	\N	{"notes": "", "newStatus": "PENDING_SIGNATURE", "updatedAt": "2025-06-26T02:31:34.268Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "applicationId": "cmccqvasx000eeoy6esx9h2t9", "originalStatus": "PENDING_SIGNATURE", "previousStatus": "PENDING_SIGNATURE"}	HIGH	\N	SYSTEM	\N
cmccropzc000ueoy6a5e0g4mf	cmca7s9g7000074c6islh1hk6	Application Status Updated	Your loan application status has been updated to PENDING_DISBURSEMENT	f	2025-06-26 02:31:35.304	2025-06-26 02:31:35.304	\N	{"notes": "", "newStatus": "PENDING_DISBURSEMENT", "updatedAt": "2025-06-26T02:31:35.303Z", "updatedBy": "cmca7s9g7000074c6islh1hk6", "applicationId": "cmccqvasx000eeoy6esx9h2t9", "originalStatus": "PENDING_DISBURSEMENT", "previousStatus": "PENDING_DISBURSEMENT"}	HIGH	\N	SYSTEM	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, code, name, description, "minAmount", "maxAmount", "repaymentTerms", "interestRate", eligibility, "originationFee", "legalFee", "applicationFee", "requiredDocuments", features, "isActive", "createdAt", "updatedAt", "loanTypes", "lateFeeFixedAmount", "lateFeeFrequencyDays", "lateFeeRate") FROM stdin;
cmca7s9gc000374c6n5j6wve0	sme	SME Growth™	Working capital financing for SMEs. Grow your business with flexible funding solutions.	50000	500000	[12, 24, 36]	1.5	{"\\"Registered business in Malaysia\\"","\\"Minimum 2 years in operation\\"","\\"Minimum annual revenue of RM300,000\\"","\\"No active bankruptcy status\\""}	2	3	50	{"\\"Business registration (SSM)\\"","\\"Latest 2 years financial statements\\"","\\"Latest 6 months bank statements\\"","\\"Tax returns\\"","\\"Directors' IDs\\""}	{"\\"Finance up to RM200,000\\"","\\"Flexible repayment terms\\"","\\"Competitive interest rates\\"","\\"Quick approval process\\"","\\"Dedicated account manager\\""}	t	2025-06-24 07:38:55.836	2025-06-24 10:01:26.146	{"\\"Working Capital\\"","\\"Business Expansion\\"","\\"Inventory Purchase\\"","\\"Renovation\\"","\\"Marketing & Advertising\\"","\\"Franchise Acquisition\\"","\\"Debt Consolidation\\""}	0	7	0.022
cmca7s9gc000274c6ogqgufst	equipment	Equipment Financing™	Finance your business equipment with flexible terms. Fast approval with minimal documentation.	50000	300000	[6, 12, 24]	1.5	{"\\"Registered business in Malaysia\\"","\\"Minimum 1 year in operation\\"","\\"Minimum monthly revenue of RM10,000\\"","\\"No active bankruptcy status\\""}	3	2	50	{"\\"Business registration (SSM)\\"","\\"Latest 6 months bank statement\\"","\\"Equipment quotation\\"","\\"Directors' IDs\\""}	{"\\"Finance up to RM50,000\\"","\\"Flexible repayment terms\\"","\\"Quick approval process\\"","\\"Competitive rates\\"","\\"No early settlement fees\\""}	t	2025-06-24 07:38:55.836	2025-06-24 10:01:26.146	{"\\"Manufacturing Equipment\\"","\\"Office Equipment\\"","\\"Construction Equipment\\"","\\"Medical Equipment\\"","\\"IT Equipment\\"","\\"Commercial Vehicle\\"","\\"Industrial Machinery\\""}	0	7	0.022
cmcaacm0s00002aenuk4m4oq1	TEST_LOAN	Test Loan Product	Test loan for late fee testing	1000	100000	{"terms": [1, 3, 6, 12]}	12	{"{\\"type\\": \\"income\\", \\"value\\": \\"1000\\"}"}	0	0	0	{"{\\"type\\": \\"id\\", \\"required\\": true}"}	{"{\\"name\\": \\"quick_approval\\"}"}	t	2025-06-24 08:50:44.476	2025-06-24 10:01:26.146	{"{\\"type\\": \\"term_loan\\"}"}	0	7	0.022
cmca7s9gc000174c6xc5t9whl	payadvance	PayAdvance™	Get up to 50% of your monthly salary in advance. Quick approval, no collateral needed.	1000	20000	[6, 12]	1.5	{"\\"Malaysian citizen aged 21-60\\"","\\"Minimum monthly income of RM2,000\\"","\\"Employed for at least 3 months\\"","\\"No active bankruptcy status\\""}	3	2	50	{"\\"Valid Malaysian ID\\"","\\"Latest 3 months payslip\\"","\\"Latest 3 months bank statement\\"","\\"Employment letter\\""}	{"\\"Get up to 50% of your salary\\"","\\"Quick 24-hour approval\\"","\\"No collateral required\\""}	t	2025-06-24 07:38:55.836	2025-06-24 10:09:04.986	{}	0	7	0.022
\.


--
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_documents (id, "userId", "applicationId", type, status, "fileUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "phoneNumber", password, "refreshToken", "fullName", "dateOfBirth", email, address1, address2, city, state, "createdAt", "updatedAt", country, "idExpiry", "idNumber", "idType", nationality, role, "zipCode", "lastLoginAt", "accountNumber", "bankName", "employerName", "employmentStatus", "monthlyIncome", "isOnboardingComplete", "kycStatus", "onboardingStep") FROM stdin;
cmca7s9g7000074c6islh1hk6	60123456789	$2b$10$HIHygwZQso4ZxCJPWSkXr.diANBbmgsCATbnShaeFBercchwZoe6u	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWNhN3M5ZzcwMDAwNzRjNmlzbGgxaGs2IiwiaWF0IjoxNzUwOTA4NDIwLCJleHAiOjE3NTg2ODQ0MjB9.2nzt9IVYv_qjjvJcRyYkF1lA7woofgnFxiW56Ck6g1c	Ivan Chew	\N	admin@growkapital.com	=fdg	asd	asd	asd	2025-06-24 07:38:55.832	2025-06-26 03:27:00.846	\N	\N	\N	\N	\N	ADMIN	12345	2025-06-26 03:27:00.846	\N	\N		Self-Employed	1000	t	t	0
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_transactions (id, "userId", "walletId", "loanId", type, amount, description, reference, metadata, "processedAt", "createdAt", "updatedAt", status) FROM stdin;
cmca7u2o0000q7433ulythxdv	cmca7s9g7000074c6islh1hk6	cmca7sp8900017433rxguwnx4	\N	LOAN_DISBURSEMENT	9500	Loan disbursement - Ref: DISB-QO66SPIL-815114	DISB-QO66SPIL-815114	{"notes": "Loan disbursed by admin", "bankName": null, "disbursedBy": "cmca7s9g7000074c6islh1hk6", "applicationId": "cmca7t05j00037433qo66spil", "bankAccountNumber": null}	2025-06-24 07:40:20.352	2025-06-24 07:40:20.352	2025-06-24 07:40:20.352	APPROVED
cmcbb48e20003eoy61y77sj6q	cmca7s9g7000074c6islh1hk6	cmca7sp8900017433rxguwnx4	cmca7u2ns000a7433dh41zfwb	LOAN_REPAYMENT	-990.04	Fresh funds loan repayment - RM 990.04	REP-1750816799354	{"loanId": "cmca7u2ns000a7433dh41zfwb", "paymentMethod": "FRESH_FUNDS", "originalAmount": 990.04, "outstandingBalance": 11800}	\N	2025-06-25 01:59:59.355	2025-06-25 01:59:59.355	PENDING
cmcbb61tx00014nru65usdpmx	cmca7s9g7000074c6islh1hk6	cmca7sp8900017433rxguwnx4	\N	DEPOSIT	100000	Test deposit for loan repayment testing - RM100,000	TEST-1750816884164	\N	2025-06-25 02:01:24.164	2025-06-25 02:01:24.165	2025-06-25 02:01:24.165	APPROVED
cmcbb6de30009eoy6507zd8tb	cmca7s9g7000074c6islh1hk6	cmca7sp8900017433rxguwnx4	cmca7u2ns000a7433dh41zfwb	LOAN_REPAYMENT	-990.04	Loan repayment for loan cmca7u2ns000a7433dh41zfwb via WALLET_BALANCE	REP-1750816899146	{"loanId": "cmca7u2ns000a7433dh41zfwb", "paymentMethod": "WALLET_BALANCE", "originalAmount": 990.04, "outstandingBalance": 11800}	2025-06-25 02:01:39.172	2025-06-25 02:01:39.147	2025-06-25 02:01:39.173	APPROVED
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallets (id, "userId", balance, "availableForWithdrawal", "totalDeposits", "totalWithdrawals", "createdAt", "updatedAt") FROM stdin;
cmca7sp8900017433rxguwnx4	cmca7s9g7000074c6islh1hk6	99009.96	99009.96	100000	990.04	2025-06-24 07:39:16.281	2025-06-25 02:01:39.15
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: late_fee_processing_logs late_fee_processing_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_fee_processing_logs
    ADD CONSTRAINT late_fee_processing_logs_pkey PRIMARY KEY (id);


--
-- Name: late_fees late_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_fees
    ADD CONSTRAINT late_fees_pkey PRIMARY KEY (id);


--
-- Name: loan_application_history loan_application_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_application_history
    ADD CONSTRAINT loan_application_history_pkey PRIMARY KEY (id);


--
-- Name: loan_applications loan_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_pkey PRIMARY KEY (id);


--
-- Name: loan_disbursements loan_disbursements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_pkey PRIMARY KEY (id);


--
-- Name: loan_repayments loan_repayments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_repayments
    ADD CONSTRAINT loan_repayments_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: notification_groups notification_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_groups
    ADD CONSTRAINT notification_groups_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: late_fee_processing_logs_processedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "late_fee_processing_logs_processedAt_idx" ON public.late_fee_processing_logs USING btree ("processedAt");


--
-- Name: late_fees_calculationDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "late_fees_calculationDate_idx" ON public.late_fees USING btree ("calculationDate");


--
-- Name: late_fees_feeType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "late_fees_feeType_idx" ON public.late_fees USING btree ("feeType");


--
-- Name: late_fees_loanRepaymentId_calculationDate_feeType_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "late_fees_loanRepaymentId_calculationDate_feeType_key" ON public.late_fees USING btree ("loanRepaymentId", "calculationDate", "feeType");


--
-- Name: late_fees_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX late_fees_status_idx ON public.late_fees USING btree (status);


--
-- Name: loan_applications_urlLink_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "loan_applications_urlLink_key" ON public.loan_applications USING btree ("urlLink");


--
-- Name: loan_disbursements_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "loan_disbursements_applicationId_key" ON public.loan_disbursements USING btree ("applicationId");


--
-- Name: loan_repayments_installmentNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loan_repayments_installmentNumber_idx" ON public.loan_repayments USING btree ("installmentNumber");


--
-- Name: loan_repayments_paymentType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loan_repayments_paymentType_idx" ON public.loan_repayments USING btree ("paymentType");


--
-- Name: loan_repayments_status_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loan_repayments_status_dueDate_idx" ON public.loan_repayments USING btree (status, "dueDate");


--
-- Name: loans_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "loans_applicationId_key" ON public.loans USING btree ("applicationId");


--
-- Name: notification_templates_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX notification_templates_code_key ON public.notification_templates USING btree (code);


--
-- Name: products_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_code_key ON public.products USING btree (code);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_phoneNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_phoneNumber_key" ON public.users USING btree ("phoneNumber");


--
-- Name: wallets_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wallets_userId_key" ON public.wallets USING btree ("userId");


--
-- Name: late_fees late_fees_loanRepaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_fees
    ADD CONSTRAINT "late_fees_loanRepaymentId_fkey" FOREIGN KEY ("loanRepaymentId") REFERENCES public.loan_repayments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loan_application_history loan_application_history_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_application_history
    ADD CONSTRAINT "loan_application_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loan_applications loan_applications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT "loan_applications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loan_applications loan_applications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT "loan_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loan_disbursements loan_disbursements_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT "loan_disbursements_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loan_repayments loan_repayments_loanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_repayments
    ADD CONSTRAINT "loan_repayments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES public.loans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loan_repayments loan_repayments_parentRepaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loan_repayments
    ADD CONSTRAINT "loan_repayments_parentRepaymentId_fkey" FOREIGN KEY ("parentRepaymentId") REFERENCES public.loan_repayments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: loans loans_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT "loans_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loans loans_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.notification_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_documents user_documents_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT "user_documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.loan_applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_documents user_documents_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT "user_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wallet_transactions wallet_transactions_loanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES public.loans(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wallet_transactions wallet_transactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wallet_transactions wallet_transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wallets wallets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

