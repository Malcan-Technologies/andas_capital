/*
  Warnings:

  - Added the required column `totalAmount` to the `loans` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "wallet_transactions_reference_key";

-- AlterTable
ALTER TABLE "loan_repayments" ADD COLUMN     "actualAmount" DOUBLE PRECISION,
ADD COLUMN     "daysEarly" INTEGER DEFAULT 0,
ADD COLUMN     "daysLate" INTEGER DEFAULT 0,
ADD COLUMN     "installmentNumber" INTEGER,
ADD COLUMN     "parentRepaymentId" TEXT,
ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "scheduledAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "dischargedAt" TIMESTAMP(3),
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "late_fees" (
    "id" TEXT NOT NULL,
    "loanRepaymentId" TEXT NOT NULL,
    "calculationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daysOverdue" INTEGER NOT NULL,
    "outstandingPrincipal" DOUBLE PRECISION NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "feeAmount" DOUBLE PRECISION NOT NULL,
    "cumulativeFees" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "late_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "late_fee_processing_logs" (
    "id" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feesCalculated" INTEGER NOT NULL DEFAULT 0,
    "totalFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overdue_repayments" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "processingTimeMs" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "late_fee_processing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "late_fees_calculationDate_idx" ON "late_fees"("calculationDate");

-- CreateIndex
CREATE INDEX "late_fees_status_idx" ON "late_fees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "late_fees_loanRepaymentId_calculationDate_key" ON "late_fees"("loanRepaymentId", "calculationDate");

-- CreateIndex
CREATE INDEX "late_fee_processing_logs_processedAt_idx" ON "late_fee_processing_logs"("processedAt");

-- CreateIndex
CREATE INDEX "loan_repayments_installmentNumber_idx" ON "loan_repayments"("installmentNumber");

-- CreateIndex
CREATE INDEX "loan_repayments_paymentType_idx" ON "loan_repayments"("paymentType");

-- CreateIndex
CREATE INDEX "loan_repayments_status_dueDate_idx" ON "loan_repayments"("status", "dueDate");

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_parentRepaymentId_fkey" FOREIGN KEY ("parentRepaymentId") REFERENCES "loan_repayments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "late_fees" ADD CONSTRAINT "late_fees_loanRepaymentId_fkey" FOREIGN KEY ("loanRepaymentId") REFERENCES "loan_repayments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
