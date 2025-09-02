-- CreateTable
CREATE TABLE "loan_signatories" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "signatoryType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "signedAt" TIMESTAMP(3),
    "docusealSubmitterId" TEXT,
    "docusealUuid" TEXT,
    "signingUrl" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_signatories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loan_signatories_loanId_idx" ON "loan_signatories"("loanId");

-- CreateIndex
CREATE INDEX "loan_signatories_status_idx" ON "loan_signatories"("status");

-- CreateIndex
CREATE INDEX "loan_signatories_signatoryType_idx" ON "loan_signatories"("signatoryType");

-- CreateIndex
CREATE UNIQUE INDEX "loan_signatories_loanId_signatoryType_key" ON "loan_signatories"("loanId", "signatoryType");

-- AddForeignKey
ALTER TABLE "loan_signatories" ADD CONSTRAINT "loan_signatories_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
