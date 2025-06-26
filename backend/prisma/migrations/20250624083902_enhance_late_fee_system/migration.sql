/*
  Warnings:

  - You are about to drop the column `lateFee` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[loanRepaymentId,calculationDate,feeType]` on the table `late_fees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "late_fees_loanRepaymentId_calculationDate_key";

-- AlterTable
ALTER TABLE "late_fees" ADD COLUMN     "feeType" TEXT NOT NULL DEFAULT 'INTEREST',
ADD COLUMN     "fixedFeeAmount" DOUBLE PRECISION,
ADD COLUMN     "frequencyDays" INTEGER;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "lateFee",
ADD COLUMN     "lateFeeFixedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lateFeeFrequencyDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "lateFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 8.0;

-- CreateIndex
CREATE INDEX "late_fees_feeType_idx" ON "late_fees"("feeType");

-- CreateIndex
CREATE UNIQUE INDEX "late_fees_loanRepaymentId_calculationDate_feeType_key" ON "late_fees"("loanRepaymentId", "calculationDate", "feeType");
