-- AlterTable
ALTER TABLE "TriggerHistory" ADD COLUMN     "internal" JSONB,
ADD COLUMN     "parameters" JSONB,
ADD COLUMN     "result" JSONB;
