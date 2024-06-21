/*
  Warnings:

  - The values [TOPIC] on the enum `TriggerType` will be removed. If these variants are still used in the database, this will fail.
  - The `triggerType` column on the `TriggerHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TriggerType_new" AS ENUM ('CRON', 'MANUAL', 'EVENT');
ALTER TABLE "Trigger" ALTER COLUMN "type" TYPE "TriggerType_new" USING ("type"::text::"TriggerType_new");
ALTER TABLE "Template_Trigger" ALTER COLUMN "type" TYPE "TriggerType_new" USING ("type"::text::"TriggerType_new");
ALTER TABLE "TriggerHistory" ALTER COLUMN "triggerType" TYPE "TriggerType_new" USING ("triggerType"::text::"TriggerType_new");
ALTER TYPE "TriggerType" RENAME TO "TriggerType_old";
ALTER TYPE "TriggerType_new" RENAME TO "TriggerType";
DROP TYPE "TriggerType_old";
COMMIT;

-- AlterTable
ALTER TABLE "TriggerHistory" DROP COLUMN "triggerType",
ADD COLUMN     "triggerType" "TriggerType";
