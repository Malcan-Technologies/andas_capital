-- CreateTable
-- Add IC/Passport and Emergency Contact fields to users table

-- Add IC/Passport Information
ALTER TABLE "users" ADD COLUMN "icNumber" TEXT;
ALTER TABLE "users" ADD COLUMN "icType" TEXT;

-- Add Emergency Contact Information
ALTER TABLE "users" ADD COLUMN "emergencyContactName" TEXT;
ALTER TABLE "users" ADD COLUMN "emergencyContactPhone" TEXT;
ALTER TABLE "users" ADD COLUMN "emergencyContactRelationship" TEXT; 