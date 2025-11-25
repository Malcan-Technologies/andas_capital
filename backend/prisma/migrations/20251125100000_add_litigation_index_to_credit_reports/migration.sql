-- AlterTable
-- Add missing litigationIndex column to credit_reports table
ALTER TABLE "credit_reports" ADD COLUMN "litigationIndex" TEXT;

-- Add missing hasDataError and errorMessage columns for better error handling
ALTER TABLE "credit_reports" ADD COLUMN "hasDataError" BOOLEAN;
ALTER TABLE "credit_reports" ADD COLUMN "errorMessage" TEXT;

