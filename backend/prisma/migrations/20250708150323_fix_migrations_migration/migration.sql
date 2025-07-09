/*
  Warnings:

  - You are about to drop the column `calculationDate` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `cumulativeFees` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `dailyRate` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `daysOverdue` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `feeAmount` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `feeType` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `fixedFeeAmount` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `frequencyDays` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `loanRepaymentId` on the `late_fees` table. All the data in the column will be lost.
  - You are about to drop the column `outstandingPrincipal` on the `late_fees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[loanId]` on the table `late_fees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `loanId` to the `late_fees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "late_fees" DROP CONSTRAINT "late_fees_loanRepaymentId_fkey";

-- DropIndex
DROP INDEX "late_fees_calculationDate_idx";

-- DropIndex
DROP INDEX "late_fees_loanRepaymentId_idx";

-- DropIndex
DROP INDEX "late_fees_loanRepaymentId_status_key";

-- AlterTable
ALTER TABLE "late_fees" DROP COLUMN "calculationDate",
DROP COLUMN "cumulativeFees",
DROP COLUMN "dailyRate",
DROP COLUMN "daysOverdue",
DROP COLUMN "feeAmount",
DROP COLUMN "feeType",
DROP COLUMN "fixedFeeAmount",
DROP COLUMN "frequencyDays",
DROP COLUMN "loanRepaymentId",
DROP COLUMN "outstandingPrincipal",
ADD COLUMN     "calculationDetails" JSONB,
ADD COLUMN     "lastCalculationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "loanId" TEXT NOT NULL,
ADD COLUMN     "totalAccruedFees" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "loan_repayments" ADD COLUMN     "lateFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lateFeesPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "principalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "late_fees_loanId_key" ON "late_fees"("loanId");

-- CreateIndex
CREATE INDEX "late_fees_lastCalculationDate_idx" ON "late_fees"("lastCalculationDate");

-- CreateIndex
CREATE INDEX "loan_repayments_loanId_dueDate_idx" ON "loan_repayments"("loanId", "dueDate");

-- AddForeignKey
ALTER TABLE "late_fees" ADD CONSTRAINT "late_fees_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
