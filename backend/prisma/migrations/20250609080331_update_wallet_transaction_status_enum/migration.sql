/*
  Warnings:

  - The `status` column on the `wallet_transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WalletTransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "wallet_transactions" DROP COLUMN "status",
ADD COLUMN     "status" "WalletTransactionStatus" NOT NULL DEFAULT 'PENDING';
