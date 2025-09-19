-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "defaultNoticesSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "defaultRiskFlaggedAt" TIMESTAMP(3),
ADD COLUMN     "defaultedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "loan_default_logs" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "daysOverdue" INTEGER NOT NULL,
    "outstandingAmount" DOUBLE PRECISION NOT NULL,
    "totalLateFees" DOUBLE PRECISION NOT NULL,
    "noticeType" TEXT,
    "whatsappMessageId" TEXT,
    "pdfLetterPath" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_default_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loan_default_logs_loanId_idx" ON "loan_default_logs"("loanId");

-- CreateIndex
CREATE INDEX "loan_default_logs_eventType_idx" ON "loan_default_logs"("eventType");

-- CreateIndex
CREATE INDEX "loan_default_logs_processedAt_idx" ON "loan_default_logs"("processedAt");

-- AddForeignKey
ALTER TABLE "loan_default_logs" ADD CONSTRAINT "loan_default_logs_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
