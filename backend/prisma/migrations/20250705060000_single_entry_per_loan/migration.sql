-- Clean up duplicate late fees by keeping only the latest one per repayment
WITH duplicate_fees AS (
  SELECT 
    id,
    "loanRepaymentId",
    ROW_NUMBER() OVER (
      PARTITION BY "loanRepaymentId" 
      ORDER BY "updatedAt" DESC, "createdAt" DESC
    ) as row_num
  FROM late_fees
  WHERE status = 'ACTIVE'
)
DELETE FROM late_fees 
WHERE id IN (
  SELECT id FROM duplicate_fees WHERE row_num > 1
);

-- Drop the existing unique constraint
DROP INDEX IF EXISTS "late_fees_loanRepaymentId_calculationDate_feeType_key";

-- Add new unique constraint on just loanRepaymentId for active entries
CREATE UNIQUE INDEX "late_fees_loanRepaymentId_active_unique" 
ON "late_fees"("loanRepaymentId") 
WHERE status = 'ACTIVE';

-- Update all existing entries to use COMBINED fee type
UPDATE "late_fees" SET "feeType" = 'COMBINED' WHERE "feeType" IN ('INTEREST', 'FIXED'); 