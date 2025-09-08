/*
  Warnings:

  - A unique constraint covering the columns `[kycId,type]` on the table `kyc_documents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "kyc_documents" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "kyc_documents_kycId_type_key" ON "kyc_documents"("kycId", "type");
