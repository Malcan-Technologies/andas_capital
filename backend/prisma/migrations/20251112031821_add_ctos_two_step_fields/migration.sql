-- AlterTable
ALTER TABLE "credit_reports" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "ctosRequestId" TEXT,
ADD COLUMN     "requestStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "requestedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "credit_reports_ctosRequestId_idx" ON "credit_reports"("ctosRequestId");

-- CreateIndex
CREATE INDEX "credit_reports_requestStatus_idx" ON "credit_reports"("requestStatus");
