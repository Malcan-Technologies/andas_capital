-- CreateTable
CREATE TABLE "admin_access_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "loginTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionDuration" INTEGER,
    "logoutTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_audit_logs" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "loanId" TEXT,
    "applicationId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOrphaned" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_access_logs_userId_idx" ON "admin_access_logs"("userId");

-- CreateIndex
CREATE INDEX "admin_access_logs_userRole_idx" ON "admin_access_logs"("userRole");

-- CreateIndex
CREATE INDEX "admin_access_logs_loginTimestamp_idx" ON "admin_access_logs"("loginTimestamp");

-- CreateIndex
CREATE INDEX "admin_access_logs_phoneNumber_idx" ON "admin_access_logs"("phoneNumber");

-- CreateIndex
CREATE INDEX "document_audit_logs_userId_idx" ON "document_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "document_audit_logs_loanId_idx" ON "document_audit_logs"("loanId");

-- CreateIndex
CREATE INDEX "document_audit_logs_applicationId_idx" ON "document_audit_logs"("applicationId");

-- CreateIndex
CREATE INDEX "document_audit_logs_documentType_idx" ON "document_audit_logs"("documentType");

-- CreateIndex
CREATE INDEX "document_audit_logs_uploadedAt_idx" ON "document_audit_logs"("uploadedAt");

-- CreateIndex
CREATE INDEX "document_audit_logs_source_idx" ON "document_audit_logs"("source");

-- CreateIndex
CREATE INDEX "document_audit_logs_isOrphaned_idx" ON "document_audit_logs"("isOrphaned");

