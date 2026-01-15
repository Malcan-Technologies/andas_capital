-- CreateTable
CREATE TABLE "internal_signers" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "icNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "signerRole" TEXT NOT NULL,
    "certSerialNo" TEXT,
    "certStatus" TEXT,
    "certValidFrom" TIMESTAMP(3),
    "certValidTo" TIMESTAMP(3),
    "lastCertCheck" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "pinVerifiedAt" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3),
    "enrolledBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_signers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internal_signers_icNumber_key" ON "internal_signers"("icNumber");

-- CreateIndex
CREATE INDEX "internal_signers_icNumber_idx" ON "internal_signers"("icNumber");

-- CreateIndex
CREATE INDEX "internal_signers_status_idx" ON "internal_signers"("status");

-- CreateIndex
CREATE INDEX "internal_signers_signerRole_idx" ON "internal_signers"("signerRole");
