/*
  Warnings:

  - A unique constraint covering the columns `[loanRepaymentId,status]` on the table `late_fees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "late_fees_loanRepaymentId_key";

-- CreateIndex
CREATE INDEX "late_fees_loanRepaymentId_idx" ON "late_fees"("loanRepaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "late_fees_loanRepaymentId_status_key" ON "late_fees"("loanRepaymentId", "status");
