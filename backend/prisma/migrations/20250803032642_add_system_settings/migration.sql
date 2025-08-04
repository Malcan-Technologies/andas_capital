-- CreateEnum
CREATE TYPE "LoanCalculationMethod" AS ENUM ('PROPORTIONAL', 'RULE_OF_78', 'FIXED_30_DAY');

-- CreateEnum
CREATE TYPE "PaymentScheduleType" AS ENUM ('FIRST_OF_MONTH', 'EXACT_MONTHLY', 'CUSTOM_DAY');

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "options" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresRestart" BOOLEAN NOT NULL DEFAULT false,
    "affectsExistingLoans" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastChangedBy" TEXT,
    "lastChangedAt" TIMESTAMP(3),

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
