-- CreateTable
CREATE TABLE "credit_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "reportType" TEXT NOT NULL,
    "icNumber" TEXT,
    "brnNumber" TEXT,
    "fullName" TEXT NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "creditScore" INTEGER,
    "dueDiligentIndex" TEXT,
    "riskGrade" TEXT,
    "summaryStatus" TEXT,
    "totalOutstanding" DOUBLE PRECISION,
    "activeAccounts" INTEGER,
    "defaultedAccounts" INTEGER,
    "legalCases" INTEGER,
    "bankruptcyRecords" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_report_logs" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "requestedBy" TEXT NOT NULL,
    "requestedByName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_report_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_reports_userId_idx" ON "credit_reports"("userId");

-- CreateIndex
CREATE INDEX "credit_reports_applicationId_idx" ON "credit_reports"("applicationId");

-- CreateIndex
CREATE INDEX "credit_reports_icNumber_idx" ON "credit_reports"("icNumber");

-- CreateIndex
CREATE INDEX "credit_report_logs_applicationId_idx" ON "credit_report_logs"("applicationId");

-- CreateIndex
CREATE INDEX "credit_report_logs_userId_idx" ON "credit_report_logs"("userId");

-- CreateIndex
CREATE INDEX "credit_report_logs_requestedBy_idx" ON "credit_report_logs"("requestedBy");

-- CreateIndex
CREATE INDEX "credit_report_logs_createdAt_idx" ON "credit_report_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "credit_reports" ADD CONSTRAINT "credit_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_report_logs" ADD CONSTRAINT "credit_report_logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
