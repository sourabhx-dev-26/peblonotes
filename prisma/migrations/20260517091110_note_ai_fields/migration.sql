-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "actionItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "aiSuggestedTitle" TEXT,
ADD COLUMN     "aiUsageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "summary" TEXT;
