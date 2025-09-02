-- AlterTable
ALTER TABLE "company_settings" ADD COLUMN     "licenseNo" TEXT;

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "freshOfferApplicationFee" DOUBLE PRECISION,
ADD COLUMN     "freshOfferLegalFee" DOUBLE PRECISION,
ADD COLUMN     "freshOfferOriginationFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "docusealSignUrl" TEXT;
