-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "agreementSignedAt" TIMESTAMP(3),
ADD COLUMN     "agreementStatus" TEXT,
ADD COLUMN     "docusealSubmissionId" TEXT;
