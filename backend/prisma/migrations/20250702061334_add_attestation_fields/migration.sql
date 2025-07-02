-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "attestationCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attestationDate" TIMESTAMP(3),
ADD COLUMN     "attestationNotes" TEXT,
ADD COLUMN     "attestationTermsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attestationType" TEXT,
ADD COLUMN     "attestationVideoWatched" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meetingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "meetingScheduledAt" TIMESTAMP(3);
