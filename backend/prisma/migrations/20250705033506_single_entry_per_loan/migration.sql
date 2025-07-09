/*
  Warnings:

  - A unique constraint covering the columns `[loanRepaymentId]` on the table `late_fees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "late_fees_feeType_idx";

-- AlterTable
ALTER TABLE "late_fees" ALTER COLUMN "feeType" SET DEFAULT 'COMBINED';

-- CreateIndex
CREATE UNIQUE INDEX "late_fees_loanRepaymentId_key" ON "late_fees"("loanRepaymentId");
